// utils/filtering.js
/**
 * Parse text search query parameter
 * @param {string} q - Search query string
 * @returns {Object} { whereClause, params, error }
 */
const parseTextSearch = (q) => {
    if (!q || typeof q !== 'string') {
        return { whereClause: null, params: [], error: null };
    }
    
    // Trim and validate input
    const searchTerm = q.trim();
    
    if (searchTerm.length === 0) {
        return { whereClause: null, params: [], error: null };
    }
    
    // Validate maximum length (prevent abuse)
    if (searchTerm.length > 200) {
        return {
            whereClause: null,
            params: [],
            error: {
                status: 400,
                error: 'Invalid search query',
                message: 'Search query is too long (maximum 200 characters)'
            }
        };
    }
    
    // Split search terms by whitespace for OR logic
    const searchTerms = searchTerm.split(/\s+/).filter(term => term.length > 0);
    
    if (searchTerms.length === 0) {
        return { whereClause: null, params: [], error: null };
    }
    
    // Build ILIKE search patterns for each term
    const params = [];
    const termConditions = [];
    
    searchTerms.forEach((term, index) => {
        const paramIndex = index + 1;
        const searchPattern = `%${term}%`;
        params.push(searchPattern);
        
        // Each term searches across all fields (OR within fields)
        termConditions.push(`(
            title ILIKE $${paramIndex} 
            OR description ILIKE $${paramIndex} 
            OR license ILIKE $${paramIndex} 
            OR array_to_string(keywords, ' ') ILIKE $${paramIndex}
            OR providers::text ILIKE $${paramIndex}
        )`);
    });
    
    // Combine all term conditions with OR (match any term)
    const whereClause = `(${termConditions.join(' OR ')})`;
    
    return { 
        whereClause, 
        params, 
        error: null 
    };
};

/**
 * Parse bbox filter parameter
 * @param {string|Array} bbox - Bounding box as "minx,miny,maxx,maxy" or array
 * @returns {Object} { whereClause, params, error }
 */
const parseBboxFilter = (bbox) => {
    // TODO: Implement bbox filtering
    // Format: minx,miny,maxx,maxy (WGS84)
    // Use PostGIS ST_Intersects with spatial_extent column
    if (!bbox) {
        return { whereClause: null, params: [], error: null };
    }
    
    // Parse bbox string to array
    let bboxArray;
    if (typeof bbox === 'string') {
        bboxArray = bbox.split(',').map(v => parseFloat(v));
    } else if (Array.isArray(bbox)) {
        bboxArray = bbox.map(v => parseFloat(v));
    } else {
        return {
            whereClause: null,
            params: [],
            error: {
                status: 400,
                error: 'Invalid bbox format',
                message: 'bbox must be "minx,miny,maxx,maxy"'
            }
        };
    }
    
    // Validate bbox has 4 coordinates
    if (bboxArray.length !== 4 || bboxArray.some(isNaN)) {
        return {
            whereClause: null,
            params: [],
            error: {
                status: 400,
                error: 'Invalid bbox',
                message: 'bbox must contain 4 valid numbers: minx,miny,maxx,maxy'
            }
        };
    }
    
    const [minx, miny, maxx, maxy] = bboxArray;
    
    // Validate coordinate ranges
    if (minx < -180 || minx > 180 || maxx < -180 || maxx > 180 ||
        miny < -90 || miny > 90 || maxy < -90 || maxy > 90) {
        return {
            whereClause: null,
            params: [],
            error: {
                status: 400,
                error: 'Invalid bbox coordinates',
                message: 'Longitude must be -180 to 180, latitude must be -90 to 90'
            }
        };
    }
    
    // TODO: Build PostGIS ST_Intersects WHERE clause
    // Example: ST_Intersects(spatial_extent, ST_MakeEnvelope($1, $2, $3, $4, 4326))
    return { whereClause: null, params: [], error: null };
};

/**
 * Parse datetime filter parameter
 * @param {string} datetime - Datetime range as ISO8601 interval
 * @returns {Object} { whereClause, params, error }
 */
const parseDatetimeFilter = (datetime) => {
    // TODO: Implement datetime filtering
    // Format: "2020-01-01T00:00:00Z/2020-12-31T23:59:59Z" or "../2020-12-31" or "2020-01-01/.."
    // Use temporal_start and temporal_end columns
    if (!datetime) {
        return { whereClause: null, params: [], error: null };
    }
    
    // Validate datetime format (basic check)
    if (typeof datetime !== 'string') {
        return {
            whereClause: null,
            params: [],
            error: {
                status: 400,
                error: 'Invalid datetime format',
                message: 'datetime must be a string'
            }
        };
    }
    
    // TODO: Parse ISO8601 interval and build WHERE clause
    return { whereClause: null, params: [], error: null };
};

const parseCql2Filter = (filter, filterLang) => {
    // TODO: Implement CQL2 filtering using queryBuilder.js
    // Validate filter-lang parameter (cql2-text, cql2-json)
    // Return parsed filter for queryBuilder
    if (!filter) {
        return { whereClause: null, params: [], error: null };
    }
    
    // Validate filter-lang
    const validLangs = ['cql2-text', 'cql2-json'];
    if (filterLang && !validLangs.includes(filterLang)) {
        return {
            whereClause: null,
            params: [],
            error: {
                status: 400,
                error: 'Invalid filter-lang',
                message: `filter-lang must be one of: ${validLangs.join(', ')}`
            }
        };
    }
    
    // TODO: Call queryBuilder.cql2ToSql(filter, filterLang)
    return { whereClause: null, params: [], error: null };
};

module.exports = {
    parseTextSearch,
    parseBboxFilter,
    parseDatetimeFilter,
    parseCql2Filter
};