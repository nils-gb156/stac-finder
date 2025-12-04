const db = require('../db');
const { parseSortby } = require('../utils/sorting');
const { parsePaginationParams, createPaginationLinks } = require('../utils/pagination');

const getCollections = async (req, res) => {
    try {
        let sql = 'SELECT * FROM stac.collections';
        
        // Whitelist of allowed columns to prevent SQL injection
        const allowedColumns = ['id', 'title', 'description', 'license'];

        // Parse and validate sorting
        const { orderByClauses, error: sortError } = parseSortby(req.query.sortby, allowedColumns);
        if (sortError) {
            return res.status(sortError.status).json({
                error: sortError.error,
                message: sortError.message
            });
        }

        if (orderByClauses.length > 0) {
            sql += ` ORDER BY ${orderByClauses.join(', ')}`;
        }

        // Parse and validate pagination
        const { limit, offset, error: paginationError } = parsePaginationParams(req.query);
        if (paginationError) {
            return res.status(paginationError.status).json({
                error: paginationError.error,
                message: paginationError.message
            });
        }
        
        // Add LIMIT and OFFSET to query
        sql += ` LIMIT ${limit} OFFSET ${offset}`;

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
        const links = createPaginationLinks(
            '/collections',
            req.query,
            offset,
            limit,
            collections.length
        );

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