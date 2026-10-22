import {
  isAndroid,
  isNative,
  timestampForFilename,
  dataUrlToBase64,
  saveImageToGallery,
  shareFile,
  browserDownload,
} from './deviceFiles'

export function buildReceiptFilename(now = new Date()) {
  return `FreshTrack_Receipt_${timestampForFilename(now)}.png`
}

/**
 * Saves the receipt PNG to the device.
 * - Android: into Pictures/FreshTrack (visible in Gallery / Files)
 * - iOS: no gallery saver yet, so open the share sheet ("Save Image")
 * - Web: regular browser download
 * @returns {Promise<{ method: 'saved' | 'shared' | 'downloaded', location?: string }>}
 */
export async function saveReceiptImage(dataUrl, filename) {
  if (isAndroid()) {
    const { path } = await saveImageToGallery({ base64: dataUrlToBase64(dataUrl), filename })
    return { method: 'saved', location: path }
  }

  if (isNative()) {
    await shareReceiptImage(dataUrl, filename)
    return { method: 'shared' }
  }

  browserDownload({ href: dataUrl, filename })
  return { method: 'downloaded' }
}

/** Writes the PNG to the app cache and opens the native share sheet. */
export function shareReceiptImage(dataUrl, filename) {
  return shareFile({
    base64: dataUrlToBase64(dataUrl),
    filename,
    title: 'FreshTrack Digital Receipt',
    text: 'Here is your official digital receipt from FreshTrack Grocery.',
    dialogTitle: 'Share Receipt',
  })
}
