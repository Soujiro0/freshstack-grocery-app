import { Capacitor, registerPlugin } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

// Native Android plugin: android/app/src/main/java/com/freshtrack/grocery/FileSaverPlugin.java
const FileSaver = registerPlugin('FileSaver')

export function isAndroid() {
  return Capacitor.getPlatform() === 'android'
}

export function isNative() {
  return Capacitor.isNativePlatform()
}

/** `2026-10-22_090507` — safe for filenames on every OS */
export function timestampForFilename(now = new Date()) {
  const datePart = now.toISOString().slice(0, 10)
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '')
  return `${datePart}_${timePart}`
}

export function dataUrlToBase64(dataUrl) {
  return dataUrl.split(',')[1]
}

export function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Android: saves into Pictures/FreshTrack. Resolves `{ uri, path }`. */
export function saveImageToGallery({ base64, filename }) {
  return FileSaver.saveImage({ data: base64, filename })
}

/** Android: saves into Download/FreshTrack. Resolves `{ uri, path }`. */
export function saveToDownloads({ base64, filename, mimeType }) {
  return FileSaver.saveDownload({ data: base64, filename, mimeType })
}

/** Writes the file to the app cache and opens the native share sheet. */
export async function shareFile({ base64, filename, title, text, dialogTitle }) {
  await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  })
  const fileUri = await Filesystem.getUri({
    path: filename,
    directory: Directory.Cache,
  })
  await Share.share({ title, text, url: fileUri.uri, dialogTitle })
}

/** Web: triggers a regular browser download for a data/blob URL. */
export function browserDownload({ href, filename }) {
  const link = document.createElement('a')
  link.download = filename
  link.href = href
  link.click()
}
