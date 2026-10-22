package com.freshtrack.grocery;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.annotation.RequiresApi;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Saves base64 file data into shared storage so it is visible to the user:
 * - saveImage    → Pictures/FreshTrack  (Gallery / Files), e.g. receipts
 * - saveDownload → Download/FreshTrack  (Files), e.g. catalog CSV exports
 * Android 10+ uses MediaStore (no permission needed); Android 7–9 writes to the
 * public folder and needs storage permission.
 */
@CapacitorPlugin(
    name = "FileSaver",
    permissions = {
        @Permission(alias = "storage", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE })
    }
)
public class FileSaverPlugin extends Plugin {

    private static final String FOLDER = "FreshTrack";

    @PluginMethod
    public void saveImage(PluginCall call) {
        start(call);
    }

    @PluginMethod
    public void saveDownload(PluginCall call) {
        start(call);
    }

    private void start(PluginCall call) {
        if (call.getString("data") == null || call.getString("filename") == null) {
            call.reject("data and filename are required");
            return;
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
            && getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermissionCallback");
            return;
        }

        save(call);
    }

    @PermissionCallback
    private void storagePermissionCallback(PluginCall call) {
        if (getPermissionState("storage") == PermissionState.GRANTED) {
            save(call);
        } else {
            call.reject("Storage permission is required to save the file", "PERMISSION_DENIED");
        }
    }

    private void save(PluginCall call) {
        boolean isImage = "saveImage".equals(call.getMethodName());
        String publicDir = isImage ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS;
        String mimeType = isImage ? "image/png" : call.getString("mimeType", "application/octet-stream");
        String filename = call.getString("filename");

        byte[] bytes;
        try {
            bytes = Base64.decode(call.getString("data"), Base64.DEFAULT);
        } catch (IllegalArgumentException e) {
            call.reject("Invalid file data", e);
            return;
        }

        try {
            String uri = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? saveWithMediaStore(isImage, publicDir, mimeType, bytes, filename)
                : saveLegacy(publicDir, mimeType, bytes, filename);

            JSObject result = new JSObject();
            result.put("uri", uri);
            result.put("path", publicDir + "/" + FOLDER + "/" + filename);
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Could not save the file", e);
        }
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private String saveWithMediaStore(
        boolean isImage, String publicDir, String mimeType, byte[] bytes, String filename
    ) throws IOException {
        ContentResolver resolver = getContext().getContentResolver();

        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
        values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
        values.put(MediaStore.MediaColumns.RELATIVE_PATH, publicDir + "/" + FOLDER);
        values.put(MediaStore.MediaColumns.IS_PENDING, 1);

        Uri collection = isImage
            ? MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
            : MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        Uri uri = resolver.insert(collection, values);
        if (uri == null) throw new IOException("MediaStore insert failed");

        try (OutputStream out = resolver.openOutputStream(uri)) {
            if (out == null) throw new IOException("Could not open output stream");
            out.write(bytes);
        } catch (IOException e) {
            resolver.delete(uri, null, null);
            throw e;
        }

        // Publish the file so Gallery / Files can see it
        values.clear();
        values.put(MediaStore.MediaColumns.IS_PENDING, 0);
        resolver.update(uri, values, null, null);
        return uri.toString();
    }

    @SuppressWarnings("deprecation")
    private String saveLegacy(String publicDir, String mimeType, byte[] bytes, String filename) throws IOException {
        File dir = new File(Environment.getExternalStoragePublicDirectory(publicDir), FOLDER);
        if (!dir.exists() && !dir.mkdirs()) throw new IOException("Could not create " + dir);

        File file = new File(dir, filename);
        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(bytes);
        }

        MediaScannerConnection.scanFile(
            getContext(),
            new String[] { file.getAbsolutePath() },
            new String[] { mimeType },
            null
        );
        return Uri.fromFile(file).toString();
    }
}
