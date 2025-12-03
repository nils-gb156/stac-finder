const db = require('../db');
const path = require('path');

// Helper function to build query string from params object
const buildQueryString = (params) => {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    }
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
};

const getCollections = async (req, res) => {
    try {
        let sql = 'SELECT * FROM stac.collections';

        // STAC-compliant sortby with +/- prefix syntax
        const sortby = req.query.sortby;
        
        // Whitelist of allowed columns to prevent SQL injection
        const allowedColumns = ['id', 'title', 'description', 'license'];

        if (sortby) {
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
                    return res.status(400).json({
                        error: 'Invalid sortby parameter',
                        message: `Field must be one of: ${allowedColumns.join(', ')}. Format: sortby=field, sortby=+field (ascending), or sortby=-field (descending)`
                    });
                }
                
                orderByClauses.push(`${field} ${direction}`);
            }
            
            if (orderByClauses.length > 0) {
                sql += ` ORDER BY ${orderByClauses.join(', ')}`;
            }
        }

        // Pagination
        const limit = parseInt(req.query.limit) || 10;
        const maxLimit = 10000;
        const token = req.query.token;
        
        // Validate limit
        if (isNaN(limit) || limit < 1) {
            return res.status(400).json({
                error: 'Invalid limit parameter',
                message: 'limit must be a positive integer'
            });
        }
        
        // Cap limit at maximum
        const effectiveLimit = Math.min(limit, maxLimit);
        
        // Decode token to get offset
        let offset = 0;
        if (token) {
            try {
                const decoded = Buffer.from(token, 'base64').toString('utf-8');
                const tokenData = JSON.parse(decoded);
                offset = tokenData.offset || 0;
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid token parameter',
                    message: 'token is malformed or invalid'
                });
            }
        }
        
        // Add LIMIT and OFFSET to query
        sql += ` LIMIT ${effectiveLimit} OFFSET ${offset}`;
        
        console.log('SQL Query:', sql); // Debug log

        const result = await db.query(sql);

        const collections = result.rows.map((row) => ({
            id: row.id.toString(),
            title: row.title,
            description: row.description,
            extend: {
                spatial: {
                    bbox: [row.bbox]
                },
                temporal: {
                    interval: [[row.temporal_start, row.temporal_end]]
                }
            },
            license: row.license,
            keywords: row.keywords,
            providers: row.provider_names?.map((name) => ({ name })),
            links: [
                {
                    rel: 'self',
                    href: `/collections/${row.id}`,
                    type: 'application/json'
                }
            ]
        }));

        // Build pagination links
        const links = [
            {
                rel: 'self',
                href: `/collections${buildQueryString(req.query)}`,
                type: 'application/json'
            }
        ];
        
        // Add 'next' link if we got a full page of results
        if (collections.length === effectiveLimit) {
            const nextOffset = offset + effectiveLimit;
            const nextToken = Buffer.from(JSON.stringify({ offset: nextOffset })).toString('base64');
            const nextQuery = { ...req.query, token: nextToken, limit: effectiveLimit };
            links.push({
                rel: 'next',
                href: `/collections${buildQueryString(nextQuery)}`,
                type: 'application/json'
            });
        }
        
        // Add 'prev' link if we're not on the first page
        if (offset > 0) {
            const prevOffset = Math.max(0, offset - effectiveLimit);
            const prevToken = Buffer.from(JSON.stringify({ offset: prevOffset })).toString('base64');
            const prevQuery = { ...req.query, token: prevToken, limit: effectiveLimit };
            links.push({
                rel: 'prev',
                href: `/collections${buildQueryString(prevQuery)}`,
                type: 'application/json'
            });
        }

        const data = {
            collections,
            links
        };
        
        // return json
        res.json(data);
        
    } catch (err) {
        console.error('Error fetching collections: ', err);
        res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = { getCollections };