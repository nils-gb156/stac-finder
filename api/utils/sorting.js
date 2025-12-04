/**
 * Parse STAC-compliant sortby parameter
 * @param {string} sortby - Sortby query parameter (e.g., "title", "+title", "-title", "+title,-id")
 * @param {Array<string>} allowedColumns - Whitelist of allowed column names
 * @returns {Object} { orderByClauses: string[], error: Object|null }
 */
const parseSortby = (sortby, allowedColumns) => {
    if (!sortby) {
        return { orderByClauses: [], error: null };
    }

    // Parse sortby parameter - comma-separated list with +/- prefix
    // Format: +field or -field (+ is default if no prefix)
    const sortFields = sortby.split(',').map(s => s.trim());
    const orderByClauses = [];

    for (const sortField of sortFields) {
        let field = sortField;
        let direction = 'ASC';

        // Check for direction prefix
        if (field.startsWith('+')) {
            field = field.substring(1);
            direction = 'ASC';
        } else if (field.startsWith('-')) {
            field = field.substring(1);
            direction = 'DESC';
        }

        // Validate field name
        if (!allowedColumns.includes(field)) {
            return {
                orderByClauses: [],
                error: {
                    status: 400,
                    error: 'Invalid sortby parameter',
                    message: `Field must be one of: ${allowedColumns.join(', ')}. Format: sortby=field, sortby=+field (ascending), or sortby=-field (descending)`
                }
            };
        }

        orderByClauses.push(`${field} ${direction}`);
    }

    return { orderByClauses, error: null };
};

module.exports = { parseSortby };
