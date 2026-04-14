import crypto from 'crypto';
import pkg from 'pg';

const { Pool } = pkg;


let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'restaurant',

      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('connect', () => {
      console.log('New client connected to PostgreSQL');
    });
  }
  return pool;
}

const query = async (text, params) => {
  const start = Date.now();
  const res = await getPool().query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 Query:', { text: text.substring(0, 80), duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
};

const generateId = () => crypto.randomUUID();

const initDB = async () => {
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        logo VARCHAR(500),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(500),
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS tables (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        table_number INTEGER NOT NULL,
        capacity INTEGER DEFAULT 4,
        is_active BOOLEAN DEFAULT TRUE,
        qr_code_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(restaurant_id, table_number)
      )
    `);

    await query(`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);

    await query(`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        customer_name VARCHAR(255),
        status order_status DEFAULT 'pending',
        total_price DECIMAL(10, 2) DEFAULT 0,
        payment_status payment_status DEFAULT 'unpaid',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id)',
    ];

    for (const idx of indexes) {
      await query(idx);
    }

    console.log(' Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  }
};


const poolProxy = {
  connect: (...args) => getPool().connect(...args),
  query: (...args) => getPool().query(...args),
  end: (...args) => getPool().end(...args),
  on: (...args) => getPool().on(...args),
};

export { generateId, initDB, poolProxy as pool, query };
export default { pool: poolProxy, query, generateId, initDB };
