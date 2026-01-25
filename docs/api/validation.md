# STAC Validation

## Overview

Validate STAC resources against the official STAC specification using the `stac-node-validator`.

## Usage

```bash
npm run validate -- <url>
```

## Examples

```bash
# Validate landing page
npm run validate -- http://localhost:4000/

# Validate collections list
npm run validate -- http://localhost:4000/collections

# Validate specific collection
npm run validate -- http://localhost:4000/collections/{id}
```

## Supported Resources

- Landing Pages
- Catalogs
- Collections
- Items

## Output

The validator returns a detailed report including:
- Overall validity status
- Core STAC errors and warnings
- Extension-specific validation results
- Detailed error messages with schema paths
