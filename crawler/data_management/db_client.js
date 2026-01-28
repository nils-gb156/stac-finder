/**
 * @file db_client.js
 * @description Initializes and exports a a PostgreSQL connection pool.
 */

import pkg from "pg"
const { Pool } = pkg

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        pool.on('error', (err) => {
            console.error('Unexpected DB error:', err);
            process.exit(-1);
        });

        console.log("DB ENV CHECK:", {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
    }
    return pool;
}

export const query = (text, params) => pool.query(text, params);
export { pool };