/**
 * Validate whether a source record contains a valid URL + type.
 *
 * @function validateSource
 * @param {Object} source - Source object.
 * @param {string} source.url - The URL to validate.
 * @param {string} source.type - The crawler-type of the source.
 * @returns {boolean} True if valid, otherwise false.
 */
export function validateSource(source) {
    if (!source.url) return false
    if (!source.type) return false

    try {
        new URL(source.url) // throws on invalid URLs
    } catch {
        return false
    }

    return true
}