-- ============================================================
-- Wingshed POS - Initial Schema
-- ============================================================

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders (order_number auto-increments for human-readable tickets)
CREATE SEQUENCE order_number_seq START 1000;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER NOT NULL DEFAULT nextval('order_number_seq'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','ready','collected','cancelled')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  payment_method TEXT NOT NULL DEFAULT 'collection'
    CHECK (payment_method IN ('stripe','collection')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid')),
  stripe_payment_intent_id TEXT,
  pickup_time TIMESTAMPTZ NOT NULL,
  order_notes TEXT,
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items (snapshot prices/names so menu changes don't break history)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  menu_item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Business Hours (0=Sunday … 6=Saturday)
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (day_of_week)
);

-- Blocked Slots (owner can block any date/time range)
CREATE TABLE blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Settings (key/value store for shop config)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read: active categories & items, hours, blocked slots, settings
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT USING (active = true);
CREATE POLICY "public_read_business_hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "public_read_blocked_slots" ON blocked_slots FOR SELECT USING (true);
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (true);

-- Orders: anyone can insert; anyone can read (kitchen & customer confirmation)
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_orders" ON orders FOR SELECT USING (true);
CREATE POLICY "public_update_orders" ON orders FOR UPDATE USING (true);

-- Order items: tied to order insert/read
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT USING (true);

-- Service role (used server-side) bypasses RLS automatically

-- ============================================================
-- Realtime
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO settings (key, value) VALUES
  ('shop_name',              'Wingshed'),
  ('shop_phone',             ''),
  ('shop_address',           ''),
  ('lead_time_minutes',      '30'),
  ('slot_duration_minutes',  '15'),
  ('max_orders_per_slot',    '5'),
  ('collection_enabled',     'true'),
  ('stripe_enabled',         'true');

INSERT INTO business_hours (day_of_week, open_time, close_time, is_open) VALUES
  (0, '12:00', '20:00', false),
  (1, '12:00', '21:00', true),
  (2, '12:00', '21:00', true),
  (3, '12:00', '21:00', true),
  (4, '12:00', '21:00', true),
  (5, '12:00', '22:00', true),
  (6, '12:00', '22:00', true);

INSERT INTO categories (name, display_order) VALUES
  ('Wings',  1),
  ('Sides',  2),
  ('Drinks', 3),
  ('Sauces', 4);

-- Sample menu items (linked via subquery so UUIDs are portable)
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Buffalo Wings (6)',   'Classic buffalo hot sauce, crispy skin',  7.50, 1 FROM categories WHERE name = 'Wings';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Buffalo Wings (12)',  'Classic buffalo hot sauce, crispy skin', 13.50, 2 FROM categories WHERE name = 'Wings';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'BBQ Wings (6)',       'Smoky BBQ glaze, fall-off-the-bone',      7.50, 3 FROM categories WHERE name = 'Wings';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'BBQ Wings (12)',      'Smoky BBQ glaze, fall-off-the-bone',     13.50, 4 FROM categories WHERE name = 'Wings';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Skin-on Fries',       'Crispy golden skin-on fries',             3.50, 1 FROM categories WHERE name = 'Sides';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Coleslaw',            'House-made creamy coleslaw',              2.50, 2 FROM categories WHERE name = 'Sides';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Corn on the Cob',     'Grilled corn with butter',                2.00, 3 FROM categories WHERE name = 'Sides';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Canned Soft Drink',   'Coke, Diet Coke, Sprite, Fanta',         1.50, 1 FROM categories WHERE name = 'Drinks';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Still Water',         '500ml bottle',                            1.00, 2 FROM categories WHERE name = 'Drinks';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Extra Buffalo Sauce', '50ml pot',                                0.50, 1 FROM categories WHERE name = 'Sauces';
INSERT INTO menu_items (category_id, name, description, price, display_order)
SELECT id, 'Extra BBQ Sauce',     '50ml pot',                                0.50, 2 FROM categories WHERE name = 'Sauces';
