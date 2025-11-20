const db = require('../db');
const path = require('path');
const { cql2ToSql } = require('../utils/cql2parser');

const getCollections = async (req, res) => {
    try {
        // Build SQL query with optional CQL2 filter
        let query = 'SELECT * FROM stac.collections';
        let queryParams = [];
        
        // Check for filter parameter
        if (req.query.filter) {
            try {
                // Convert CQL2 filter to SQL WHERE clause with parameters
                const { sql, params } = await cql2ToSql(req.query.filter);
                query += ` WHERE ${sql}`;
                queryParams = params;
            } catch (filterErr) {
                console.error('CQL2 filter error:', filterErr);
                return res.status(400).json({
                    error: 'Invalid CQL2 filter',
                    message: filterErr.message
                });
            }
        }
        
        
        const result = await db.query(query, queryParams);

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

        // Always return JSON
        res.json(data);
        
    } catch (err) {
        console.error('Error fetching collections: ', err);
        res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = { getCollections };