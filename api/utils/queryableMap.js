module.exports = {
    id: { column: 'c.id', type: 'text' },
    title: { column: 'c.title', type: 'text' },
    description: { column: 'c.description', type: 'text' },
    license: { column: 'c.license', type: 'text' },
    doi: { column: 'c.doi', type: 'text' },
  
    // Arrays
    keywords: { column: 'c.keywords', type: 'text_array' },
    platform_summary: { column: 'c.platform_summary', type: 'text_array' },
    constellation_summary: { column: 'c.constellation_summary', type: 'text_array' },
    processing_level_summary: { column: 'c.processing_level_summary', type: 'text_array' },
  
    // Timestamps
    temporal_start: { column: 'c.temporal_start', type: 'timestamptz' },
    temporal_end: { column: 'c.temporal_end', type: 'timestamptz' },
  
    // Spatial
    spatial_extent: { column: 'c.spatial_extent', type: 'geometry' },
    
    // gsd_summary: { column: 'gsd_summary', type: 'jsonb' },
    // providers: { column: 'providers', type: 'jsonb' },
  };
  