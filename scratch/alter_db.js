import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/db.js';

async function migrate() {
    try {
        await pool.query('ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);');
        console.log('Migration successful');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit(0);
    }
}
migrate();
