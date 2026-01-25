import Ajv from "ajv";
import addFormats from "ajv-formats";

// Create AJV instance. "Npm install ajv ajv-formats" command required to use.
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// COLLECTION SCHEMA
// Describes a valid STAC Collection 
const stacCollectionSchema = {
    type: "object",
    // Core required fields for a Collection
    required: ["type", "stac_version", "id", "description", "license", "extent", "links"],
    properties: {
        // Must be exactly "Collection"
        type: { const: "Collection" },

        // Version and optional extensions
        stac_version: { type: "string" },
        stac_extensions: { type: "array", items: { type: "string" } },

        // Basic metadata
        id: { type: "string", minLength: 1 },
        title: { type: "string" },
        description: { type: "string", minLength: 1 },
        keywords: { type: "array", items: { type: "string" } },
        license: { type: "string" },

        // Optional provider info
        providers: {
            type: "array",
            items: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                    roles: { type: "array", items: { type: "string" } },
                    url: { type: "string", format: "uri" },
                    description: { type: "string" }
                }
            }
        },

        // Spatial and temporal coverage
        extent: {
            type: "object",
            required: ["spatial", "temporal"],
            properties: {
                spatial: {
                    type: "object",
                    required: ["bbox"],
                    properties: {
                        // Array of bboxes. Each bbox is 2D (4 numbers) or 3D (6 numbers)
                        bbox: {
                            type: "array",
                            minItems: 1,
                            items: {
                                oneOf: [
                                    { type: "array", minItems: 4, maxItems: 4, items: { type: "number" } },
                                    { type: "array", minItems: 6, maxItems: 6, items: { type: "number" } }
                                ]
                            }
                        }
                    }
                },
                temporal: {
                    type: "object",
                    required: ["interval"],
                    properties: {
                        // Array of [start, end]
                        interval: {
                            type: "array",
                            minItems: 1,
                            items: {
                                type: "array",
                                minItems: 2,
                                maxItems: 2,
                                items: [
                                    { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
                                    { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] }
                                ]
                            }
                        }
                    }
                }
            }
        },

        // At least one link
        links: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                required: ["rel", "href"],
                properties: {
                    rel: { type: "string" },
                    href: { type: "string", minLength: 1 },
                    type: { type: "string" },
                    title: { type: "string" }
                }
            }
        },

        // Flexible extension areas
        summaries: { type: "object", additionalProperties: true },
        assets: { type: "object", additionalProperties: true }
    },
    // Allow extra fields 
    additionalProperties: true
};

// CATALOG SCHEMA
// Describes a valid STAC Catalog (simpler than Collection)
const stacCatalogSchema = {
    type: "object",
    // Core required fields for a Catalog
    required: ["type", "stac_version", "id", "description", "links"],
    properties: {
        // Must be exactly "Catalog"
        type: { const: "Catalog" },

        // Version and optional extensions
        stac_version: { type: "string" },
        stac_extensions: { type: "array", items: { type: "string" } },

        // Basic metadata
        id: { type: "string", minLength: 1 },
        title: { type: "string" },
        description: { type: "string", minLength: 1 },

        // Minimal link structure
        links: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                required: ["rel", "href"],
                properties: {
                    rel: { type: "string" },
                    href: { type: "string", minLength: 1 }
                }
            }
        }
    },
    // Allow extra fields 
    additionalProperties: true
};

// Compile both schemas once (reuse for each validation call)
const validateColl = ajv.compile(stacCollectionSchema);
const validateCat = ajv.compile(stacCatalogSchema);

/**
 * Validates a STAC object by type.
 * - Feature (Item): ignored (treated as valid but skipped)
 * - Collection: validated against collection schema
 * - Catalog: validated against catalog schema
 * Returns flags and a compact error summary.
 */
export function validateStacObject(json) {
    // Ignore Items (Features)
    if (json.type === "Feature") {
        return {
            valid: true,
            isIgnored: true,
            errors: null,
            errorsText: "Object is an Item (Feature) - Ignored per requirements."
        };
    }

    // Pick schema by type
    let validateFn;
    const objectType = json.type;

    if (objectType === "Collection") {
        validateFn = validateColl;
    } else if (objectType === "Catalog") {
        validateFn = validateCat;
    } else {
        // Unknown or missing type
        return {
            valid: false,
            isIgnored: false,
            errors: [{ message: "Unknown or missing 'type' field. Must be Collection or Catalog." }],
            errorsText: "Unknown or missing 'type' field."
        };
    }

    // Run validation and format errors
    const valid = validateFn(json);

    if (valid) {
        return { valid: true, isIgnored: false, errors: null, errorsText: null };
    } else {
        const errorsText = validateFn.errors
            .map(err => `${err.instancePath} ${err.message}`)
            .join("; ");

        return {
            valid: false,
            isIgnored: false,
            errors: validateFn.errors,
            errorsText: `Invalid STAC ${objectType}: ${errorsText}`
        };
    }
}
