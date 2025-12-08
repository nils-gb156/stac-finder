const path = require('path');

const getQueryables = async (req, res) => {
    try {
        
        const queryables = {
            type: 'Queryables',
            title: 'Filterbare Felder für STAC-Collections',
            description:
                'Diese Ressource beschreibt alle Felder, nach denen in /collections gefiltert werden kann.',
            properties: {
                title: {
                    type: 'string',
                    title: 'Titel',
                    description: 'Titel der Collection für Freitextsuche'
                },
                description: {
                    type: 'string',
                    title: 'Beschreibung',
                    description: 'Beschreibung der Collection für Freitextsuche'
                },
                keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    title: 'Schlagworte',
                    description: 'Keywords zur thematischen Filterung'
                },
                license: {
                    type: 'string',
                    title: 'Lizenz',
                    description: 'Lizenz der Daten (z.B. CC-BY-4.0, proprietary)'
                },
                platform_summary: {
                    type: 'array',
                    items: { type: 'string' },
                    title: 'Plattformen',
                    description: 'Satelliten/Plattformen (z.B. Sentinel-2, Landsat-8)'
                },
                constellation_summary: {
                    type: 'array',
                    items: { type: 'string' },
                    title: 'Konstellationen',
                    description: 'Satelliten-Konstellationen (z.B. Sentinel, Landsat)'
                },
                gsd_summary: {
                    type: 'array',
                    items: { type: 'string' },
                    title: 'Ground Sampling Distance',
                    description: 'Bodenauflösung der Daten (z.B. 10m, 30m)'
                },
                processing_level_summary: {
                    type: 'array',
                    items: { type: 'string' },
                    title: 'Verarbeitungslevel',
                    description: 'Verarbeitungsstufe der Daten (z.B. L1C, L2A)'
                },
                spatial_extent: {
                    type: 'object',
                    title: 'Räumliche Ausdehnung',
                    description: 'Geografische Bounding Box für räumliche Filterung (GeoJSON Polygon)',
                    properties: {
                        type: { type: 'string' },
                        coordinates: { type: 'array' }
                    }
                },
                temporal_extent: {
                    type: 'array',
                    items: { type: 'string', format: 'date-time' },
                    minItems: 2,
                    maxItems: 2,
                    title: 'Zeitliche Ausdehnung',
                    description: 'Zeitraum der Daten [Start, Ende] für zeitliche Filterung'
                }
            }
        };

        res.json(queryables);
        
    } catch (err) {
        console.error('Error fetching queryables: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getQueryables };
