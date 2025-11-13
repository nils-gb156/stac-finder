const db = require('../db');
const path = require('path');
const { parseCQL2 } = require('cql2-sql-translator');

const getCollections = async (req, res) => {
    try {
        // Base query
        let query = 'SELECT * FROM stac.collections';
        let values = [];

        // Handle filter parameter
        const filterParam = req.query.filter;
        if (filterParam) {
            try {
                console.log('Filter parameter:', filterParam);
                // Parse CQL2 filter - returns { sql, values } directly
                const sqlResult = parseCQL2(filterParam);
                console.log('Generated SQL:', sqlResult);
                // Extract WHERE clause (remove "WHERE " prefix if present)
                const whereClause = sqlResult.sql.replace(/^WHERE\s+/i, '');
                query += ` WHERE ${whereClause}`;
                values = sqlResult.values;
            } catch (filterError) {
                console.error('Filter error:', filterError);
                return res.status(400).json({
                    error: 'Invalid filter parameter',
                    message: filterError.message
                });
            }
        }

        // Add ORDER BY
        query += ' ORDER BY title';

        // Execute query
        const result = await db.query(query, values);

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

        // Content Negotiation: Query Parameter + Accept Header
        const format = req.query.f;
        const acceptHeader = req.get('Accept') || '';
        
        // Validate format-paramter (when given)
        if (format && format !== 'json' && format !== 'html') {
            return res.status(400).json({
                error: 'Invalid format parameter',
                message: 'Format must be either "json" or "html"'
            });
        }
        
        // Check explicit format parameters first, then Accept header
        if (format === 'html' || (!format && acceptHeader.includes('text/html'))) {
            return res.sendFile(path.join(__dirname, '../../web-ui/collections.html'));
        }
        
        // Default: JSON for API-Clients
        res.json(data);
        
    } catch (err) {
        console.error('Error fetching collections: ', err);
        res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = { getCollections };