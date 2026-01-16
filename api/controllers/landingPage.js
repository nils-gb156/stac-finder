const getLandingPage = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const landingPage = {
            id: 'stacfinder',
            title: 'STACFinder API',
            description: 'A STAC-compliant API for browsing and searching SpatioTemporal Asset Catalogs stored in PostgreSQL/PostGIS.',
            conformsTo: [
                'https://api.stacspec.org/v1.0.0/core',
                'https://api.stacspec.org/v1.0.0/collections'
            ],
            links: [
                {
                    rel: 'self',
                    type: 'application/json',
                    href: `${baseUrl}/`
                },
                {
                    rel: 'root',
                    type: 'application/json',
                    href: `${baseUrl}/`
                },
                {
                    rel: 'conformance',
                    type: 'application/json',
                    href: `${baseUrl}/conformance`
                },
                {
                    rel: 'collections',
                    type: 'application/json',
                    href: `${baseUrl}/collections`
                },
                {
                    rel: 'queryables',
                    type: 'application/schema+json',
                    href: `${baseUrl}/collections/queryables`
                },
                {
                    rel: 'service-desc',
                    type: 'application/vnd.oai.openapi+json;version=3.0',
                    href: `${baseUrl}/api`
                }
            ]
        };

        res.json(landingPage);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate landing page'
        });
    }
};

module.exports = { getLandingPage };
