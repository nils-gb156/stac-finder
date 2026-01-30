module.exports = {
  // Text (scalar)
  id: { column: 'c.id', type: 'text' },
  title: { column: 'c.title', type: 'text' },
  description: { column: 'c.description', type: 'text' },
  license: { column: 'c.license', type: 'text' },
  doi: { column: 'c.doi', type: 'text' },

  // Timestamps
  temporal_start: { column: 'c.temporal_start', type: 'timestamptz' },
  temporal_end: { column: 'c.temporal_end', type: 'timestamptz' },

  // Spatial
  spatial_extent: { column: 'c.spatial_extent', type: 'geometry' }
};
