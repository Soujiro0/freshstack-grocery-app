import { toCatalogCsv } from './catalogCsv'
import {
  isAndroid,
  isNative,
  timestampForFilename,
  utf8ToBase64,
  saveToDownloads,
  shareFile,
  browserDownload,
} from './deviceFiles'

export function buildCatalogFilename(now = new Date()) {
  return `FreshTrack_Catalog_${timestampForFilename(now)}.csv`
}

/**
 * Exports the catalog as CSV.
 * - Android: into Download/FreshTrack (visible in Files)
 * - iOS: share sheet ("Save to Files")
 * - Web: regular browser download
 * @returns {Promise<{ method: 'saved' | 'shared' | 'downloaded', filename: string, location?: string }>}
 */
export async function exportCatalogCsv(catalog = []) {
  const csv = toCatalogCsv(catalog)
  const filename = buildCatalogFilename()

  if (isAndroid()) {
    const { path } = await saveToDownloads({
      base64: utf8ToBase64(csv),
      filename,
      mimeType: 'text/csv',
    })
    return { method: 'saved', filename, location: path }
  }

  if (isNative()) {
    await shareFile({
      base64: utf8ToBase64(csv),
      filename,
      title: 'FreshTrack Staples Catalog',
      dialogTitle: 'Export Catalog',
    })
    return { method: 'shared', filename }
  }

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  browserDownload({ href: url, filename })
  setTimeout(() => URL.revokeObjectURL(url), 0)
  return { method: 'downloaded', filename }
}
