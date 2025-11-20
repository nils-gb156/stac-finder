#!/usr/bin/env python3
"""
CQL2 to SQL Converter Service using cql2 library (Rust-based)
Usage: python cql2-service.py '<cql2-filter>'
"""

import sys
import json
import re
from cql2 import Expr

def adapt_to_postgis(sql_string, params):
    """
    Adapt generic SQL spatial functions to PostGIS-specific functions
    
    Args:
        sql_string: SQL string with generic spatial functions
        params: List of parameters that may contain geometry strings
    
    Returns:
        Tuple of (sql_string, params) with PostGIS functions and cleaned parameters
    """
    # Map generic CQL2 spatial functions to PostGIS equivalents
    replacements = {
        r'\bintersects\(': 'ST_Intersects(',
        r'\bcontains\(': 'ST_Contains(',
        r'\bwithin\(': 'ST_Within(',
        r'\boverlaps\(': 'ST_Overlaps(',
        r'\btouches\(': 'ST_Touches(',
        r'\bcrosses\(': 'ST_Crosses(',
        r'\bdisjoint\(': 'ST_Disjoint(',
        r'\bequals\(': 'ST_Equals(',
        r'\bdwithin\(': 'ST_DWithin(',
        r'\bbbox\(': 'ST_MakeEnvelope(',
    }
    
    for pattern, replacement in replacements.items():
        sql_string = re.sub(pattern, replacement, sql_string, flags=re.IGNORECASE)
    
    # Clean up geometry parameters - remove EPSG prefix if present
    # PostGIS expects plain WKT, we'll use ST_GeomFromText with SRID
    cleaned_params = []
    for param in params:
        if isinstance(param, str) and param.startswith('EPSG:'):
            # Extract SRID and WKT: "EPSG:4326;POLYGON(...)" -> "POLYGON(...)"
            parts = param.split(';', 1)
            if len(parts) == 2:
                cleaned_params.append(parts[1])  # Just the WKT part
            else:
                cleaned_params.append(param)
        else:
            cleaned_params.append(param)
    
    # If we have spatial functions, wrap geometry parameters with ST_GeomFromText
    if any(func in sql_string for func in ['ST_Intersects', 'ST_Contains', 'ST_Within', 'ST_Overlaps']):
        # Replace $N parameters in spatial functions with ST_GeomFromText($N, 4326)
        # Find spatial function calls and wrap their geometry parameters
        sql_string = re.sub(
            r'(ST_(?:Intersects|Contains|Within|Overlaps|Touches|Crosses|Disjoint|Equals))\(([^,]+),\s*(\$\d+)\)',
            r'\1(\2, ST_GeomFromText(\3, 4326))',
            sql_string
        )
    
    return sql_string, cleaned_params

def convert_cql2_to_sql(cql2_input):
    """
    Convert CQL2 filter (text or JSON) to SQL WHERE clause using cql2.Expr.to_sql()
    
    Args:
        cql2_input: CQL2 filter as text string or JSON string/dict
    
    Returns:
        dict with success status and SQL string or error
    """
    try:
        # Try to parse as JSON first
        try:
            if isinstance(cql2_input, str):
                # Try to parse as JSON
                try:
                    cql2_obj = json.loads(cql2_input)
                    # Create Expr from JSON
                    expr = Expr(json.dumps(cql2_obj))
                except json.JSONDecodeError:
                    # If not JSON, treat as CQL2 text
                    expr = Expr(cql2_input)
            else:
                cql2_obj = cql2_input
                expr = Expr(json.dumps(cql2_obj))
        except Exception:
            # If all else fails, treat as CQL2 text
            expr = Expr(cql2_input)
        
        # Convert to SQL (returns SqlQuery object)
        sql_query = expr.to_sql()
        
        # Post-process SQL to use PostGIS functions
        sql_string, params = adapt_to_postgis(sql_query.query, sql_query.params)
        
        return {
            'success': True,
            'sql': sql_string,
            'params': params
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'type': type(e).__name__
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'No CQL2 filter provided. Usage: python cql2-service.py "<cql2-filter>"'
        }))
        sys.exit(1)
    
    cql2_input = sys.argv[1]
    result = convert_cql2_to_sql(cql2_input)
    print(json.dumps(result))
