const db = require('../db');
const path = require('path');

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

        const data = {
            collections,
            links: [
                {
                    rel: 'self',
                    href: '/collections',
                    type: 'application/json'
                }
            ]
        };
        
        // return json
        res.json(data);
        
    } catch (err) {
        console.error('Error fetching collections: ', err);
        res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = { getCollections };