const db = require('../db');
const path = require('path');

const getCollections = async (req, res) => {
    try {
        let sql = 'SELECT * FROM stac.collections';

        // Order by with validation
        const orderby = req.query.orderby;
        const sortorder = req.query.sortorder || 'ASC';
        
        // Whitelist of allowed columns to prevent SQL injection
        const allowedColumns = ['id', 'title', 'description', 'license'];
        const allowedSortOrders = ['ASC', 'DESC'];

        if (orderby) {
            // Validate column name
            if (!allowedColumns.includes(orderby)) {
                return res.status(400).json({
                    error: 'Invalid orderby parameter',
                    message: `orderby must be one of: ${allowedColumns.join(', ')}`
                });
            }
            
            // Validate sort order
            const sortOrderUpper = sortorder.toUpperCase();
            if (!allowedSortOrders.includes(sortOrderUpper)) {
                return res.status(400).json({
                    error: 'Invalid sortorder parameter',
                    message: 'sortorder must be either ASC or DESC'
                });
            }
            
            sql += ` ORDER BY ${orderby} ${sortOrderUpper}`;
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