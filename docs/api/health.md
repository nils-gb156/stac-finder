# Health Endpoint

## Overview

The Health endpoint provides a simple health check for the API and database connectivity. It can be used for monitoring, load balancing, and ensuring system availability.

**Available Endpoint:**
- `GET /health` - Check API and database status

---

## GET /health

Returns the current health status of the API and its database connection.

### Request
```
GET /health
```

### Query Parameters

This endpoint does not accept any query parameters.

### Response

Returns a JSON object indicating the health status of the API components.

**Response Structure (Success):**
```json
{
  "status": "ok",
  "api": "up",
  "database": "up",
  "target": {
    "host": "finder.stacindex.org",
    "port": "5432",
    "database": "stacfinder"
  },
  "timestamp": "2026-01-19T12:21:52.700Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall system status: "ok" or "degraded" |
| `api` | string | API service status: "up" or "down" |
| `database` | string | Database connection status: "up" or "down" |
| `target` | object | Database connection information |
| `target.host` | string | Database host address |
| `target.port` | string | Database port number |
| `target.database` | string | Database name |
| `timestamp` | string | ISO8601 timestamp of the health check |

### Example Check system health

```bash
curl "http://localhost:4000/health"
```
Returns the current health status.

### Success Response

#### 200 OK
Returned when both API and database are operational.
```json
{
  "status": "ok",
  "api": "up",
  "database": "up",
  "target": {
    "host": "finder.stacindex.org",
    "port": "5432",
    "database": "stacfinder"
  },
  "timestamp": "2026-01-19T12:21:52.700Z"
}
```

### Error Responses

#### 503 Service Unavailable
Returned when the database connection fails but the API is still responding.
```json
{
  "status": "degraded",
  "api": "up",
  "database": "down",
  "target": {
    "host": "finder.stacindex.org",
    "port": "5432",
    "database": "stacfinder"
  },
  "timestamp": "2026-01-19T12:21:52.700Z"
}
```

**Possible Causes:**
- Database server is down
- Network connectivity issues
- Invalid database credentials
- Database is overloaded or unresponsive

---

## Health Check Behavior

The health check performs the following operations:

1. **API Check**: Always returns "up" if the endpoint responds
2. **Database Check**: Executes a simple `SELECT 1` query to verify connectivity
3. **Response Time**: Typically responds in milliseconds for a healthy system
4. **No Side Effects**: The health check does not modify any data

### Status Interpretation

| Status | API | Database | Meaning |
|--------|-----|----------|---------|
| `ok` | up | up | System is fully operational |
| `degraded` | up | down | API is running but database is unavailable |

---

## Use Cases

### Monitoring and Alerting
```bash
# Check if system is healthy
if [ $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health) -eq 200 ]; then
  echo "✓ System healthy"
else
  echo "✗ System degraded - alert admin"
fi
```

### Load Balancer Configuration
Configure your load balancer to use `/health` as the health check endpoint:
- **Health check path**: `/health`
- **Expected status code**: `200`
- **Check interval**: 5-30 seconds
- **Timeout**: 2-5 seconds
- **Unhealthy threshold**: 2-3 consecutive failures

### Container Orchestration
For Docker/Kubernetes health probes:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 30
  
readinessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## Related Documentation

- [Collections](collections.md) - Main collections endpoints
- [Queryables](queryables.md) - Queryables schema endpoint