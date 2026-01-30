const path = require('path');

const getQueryables = async (req, res) => {
  try {
    res.type('application/schema+json');

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pathNoQuery = req.originalUrl.split('?')[0];
    const schemaId = `${baseUrl}${pathNoQuery}`;

    const queryables = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: schemaId,

      title: 'Collections Queryables',
      description:
        'JSON Schema describing the properties that can be used in filter expressions for /collections.',

      type: 'object',
      additionalProperties: false,

      properties: {
        id: {
          type: 'string',
          title: 'ID',
          description: 'Collection identifier'
        },
        title: {
          type: 'string',
          title: 'Title',
          description: 'Collection title'
        },
        description: {
          type: 'string',
          title: 'Description',
          description: 'Collection description'
        },
        license: {
          type: 'string',
          title: 'License',
          description: 'License string (e.g. CC-BY-4.0)'
        },
        doi: {
          type: 'string',
          title: 'DOI',
          description: 'Digital Object Identifier'
        },

        temporal_start: {
          type: 'string',
          format: 'date-time',
          title: 'Temporal start',
          description: 'Start of the temporal extent'
        },
        temporal_end: {
          type: 'string',
          format: 'date-time',
          title: 'Temporal end',
          description: 'End of the temporal extent (may be null/open-ended)'
        },

        spatial_extent: {
          title: 'Spatial extent',
          description: 'Geometry used for spatial filtering',
          'x-ogc-role': 'primary-geometry',
          format: 'geometry-any'
        }
      }
    };

    return res.json(queryables);
  } catch (err) {
    console.error('Error fetching queryables: ', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getQueryables };

