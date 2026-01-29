const getLandingPage = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const landingPage = {
            type: 'Catalog',
            stac_version: '1.0.0',
            id: 'stacfinder',
            title: 'STACFinder API',
            description: 'A STAC-compliant API for browsing and searching SpatioTemporal Asset Catalogs stored in PostgreSQL/PostGIS.',
            conformsTo: [
                'https://api.stacspec.org/v1.0.0/core',
                'https://api.stacspec.org/v1.0.0/collections',
                'https://api.stacspec.org/v1.0.0/collection-search',
                'http://www.opengis.net/spec/ogcapi-common-2/1.0/conf/simple-query',
                'https://api.stacspec.org/v1.0.0-rc.1/collection-search#free-text',
                'https://api.stacspec.org/v1.0.0-rc.1/collection-search#filter',
                'https://api.stacspec.org/v1.1.0/collection-search#sort',
                'https://api.stacspec.org/v1.0.0/collection-search#fields',
                'http://www.opengis.net/spec/cql2/1.0/conf/cql2-text',
                'http://www.opengis.net/spec/cql2/1.0/conf/cql2-json',
                'http://www.opengis.net/spec/cql2/1.0/conf/basic-spatial-functions'
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
                    rel: 'service-conformance',
                    type: 'application/json',
                    href: `${baseUrl}/conformance`,
                    title: "OGC conformance classes implemented by this API"
                },
                {
                    rel: 'data',
                    type: 'application/json',
                    href: `${baseUrl}/collections`,
                    title: "Metadata about the feature collections"
                },
                {
                    rel: 'service-queryables',
                    type: 'application/schema+json',
                    href: `${baseUrl}/collections/queryables`,
                    title: "Queryables for collection search"
                },
                {
                    rel: 'service-desc',
                    type: 'application/vnd.oai.openapi+json;version=3.0',
                    href: `${baseUrl}/openapi.json`,
                    title: "OpenAPI definition in JSON format"
                },
                {
                    rel: "service-doc",
                    href: "https://github.com/GeoStack-Solutions/stac-finder/blob/main/docs/README.md",
                    type: "text/html",
                    title: "STACFinder API Documentation"
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
