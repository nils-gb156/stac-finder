const db = require('../db');
const path = require('path');

const getCollections = async (req, res) => {
    try {
        let sql = 'SELECT * FROM stac.collections';

        // STAC-compliant sortby with field:direction syntax
        const sortby = req.query.sortby;
        
        // Whitelist of allowed columns to prevent SQL injection
        const allowedColumns = ['id', 'title', 'description', 'license'];
        const allowedDirections = ['asc', 'desc'];

        if (sortby) {
            // Parse sortby parameter (format: field:direction or just field)
            const parts = sortby.split(':');
            const field = parts[0];
            const direction = (parts[1] || 'asc').toLowerCase();
            
            // Validate field name
            if (!allowedColumns.includes(field)) {
                return res.status(400).json({
                    error: 'Invalid sortby parameter',
                    message: `Field must be one of: ${allowedColumns.join(', ')}. Format: sortby=field or sortby=field:asc or sortby=field:desc`
                });
            }
            
            // Validate direction
            if (!allowedDirections.includes(direction)) {
                return res.status(400).json({
                    error: 'Invalid sortby direction',
                    message: 'Direction must be either asc or desc. Format: sortby=field:asc or sortby=field:desc'
                });
            }
            
            sql += ` ORDER BY ${field} ${direction.toUpperCase()}`;
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