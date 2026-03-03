/**
 * Barcode utility helpers for sneaker UPC decoding.
 *
 * Nike and other brands embed style IDs in their UPC barcodes.
 * This module attempts to extract searchable information from raw barcodes
 * so we can search GOAT directly instead of relying on UPC databases.
 */

/** Check if a string looks like a UPC/EAN barcode (10-14 digits). */
export function isBarcode(code: string): boolean {
  return /^\d{10,14}$/.test(code.trim())
}

/** Check if a string looks like a sneaker style ID (e.g. DH6927-111, CW2288-111). */
export function isStyleId(code: string): boolean {
  return /^[A-Z]{1,3}\d{3,5}[- ]\d{2,3}$/i.test(code.trim())
}

/**
 * Try to extract a style ID from a Nike UPC barcode.
 *
 * Nike UPC-A barcodes (12 digits) use prefix 19 or 00.
 * The embedded product code sometimes maps to a style ID via known patterns.
 * This is a heuristic — it won't work for every barcode, but when it does,
 * it lets us skip the UPC database entirely.
 */
export function extractStyleIdFromBarcode(barcode: string): string | null {
  const clean = barcode.trim()

  // Can't extract anything from non-numeric barcodes
  if (!/^\d{10,14}$/.test(clean)) return null

  // Nike barcodes starting with 19 or 00 — the middle digits sometimes
  // correlate with the style but there's no public mapping algorithm.
  // We can't reliably decode these, so return null and let the
  // UPC lookup + GOAT search handle it.
  return null
}

/**
 * Generate search queries from a barcode for GOAT Algolia search.
 * Returns an array of queries to try (most specific first).
 */
export function barcodeSearchQueries(barcode: string): string[] {
  const queries: string[] = []

  // Try the raw barcode as a search (some products indexed by UPC)
  queries.push(barcode)

  // Try without leading zeros (EAN → UPC conversion)
  const noLeadingZeros = barcode.replace(/^0+/, '')
  if (noLeadingZeros !== barcode && noLeadingZeros.length >= 10) {
    queries.push(noLeadingZeros)
  }

  return queries
}

/**
 * Normalize a style ID for search (uppercase, dash-separated).
 * "dh6927 111" → "DH6927-111"
 */
export function normalizeStyleId(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '-')
}
