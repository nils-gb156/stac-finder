const { spawn } = require('child_process');
const path = require('path');

/**
 * Convert CQL2 filter to SQL WHERE clause using cql2 library (Rust-based)
 * 
 * @param {Object|string} cql2Filter - CQL2 filter as object, JSON string, or CQL2 text
 * @returns {Promise<{sql: string, params: Array}>} SQL WHERE clause with parameters
 * 
 * @example
 * // CQL2 JSON object
 * const {sql, params} = await cql2ToSql({ op: "=", args: [{ property: "id" }, "03"] });
 * // Returns: {sql: '("id" = $1)', params: ['03']}
 * 
 * @example
 * // CQL2 text
 * const {sql, params} = await cql2ToSql("id = '03'");
 * // Returns: {sql: '("id" = $1)', params: ['03']}
 */
async function cql2ToSql(cql2Filter) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'cql2-service.py');
        
        // Convert to string if object
        const cql2Input = typeof cql2Filter === 'object' 
            ? JSON.stringify(cql2Filter) 
            : cql2Filter;
        
        // Spawn Python process
        const python = spawn('python', [pythonScript, cql2Input]);
        
        let stdout = '';
        let stderr = '';
        
        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        python.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
            }
            
            try {
                const result = JSON.parse(stdout);
                
                if (result.success) {
                    resolve({
                        sql: result.sql,
                        params: result.params || []
                    });
                } else {
                    reject(new Error(`CQL2 parsing failed: ${result.error}`));
                }
            } catch (err) {
                reject(new Error(`Failed to parse Python output: ${err.message}\nOutput: ${stdout}`));
            }
        });
        
        python.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
    });
}

module.exports = { cql2ToSql };
