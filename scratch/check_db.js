import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/db.js';

async function check() {
    try {
        const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 3;');
        console.log("Recent orders:", res.rows.map(o => ({
           id: o.id,
           status: o.status,
           payment_status: o.payment_status,
           customer_name: o.customer_name,
           customer_email: o.customer_email,
        })));
    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        process.exit(0);
    }
}
check();
