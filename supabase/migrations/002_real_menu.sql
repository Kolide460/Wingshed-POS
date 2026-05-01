-- ─────────────────────────────────────────────
-- Wingshed real menu data
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────

-- Clear placeholder data (orders are preserved; order_items.menu_item_id goes NULL via FK)
DELETE FROM menu_items;
DELETE FROM categories;

-- ── Categories ────────────────────────────────
INSERT INTO categories (id, name, display_order, active) VALUES
  ('c1000000-0001-0000-0000-000000000000', 'Wings & Tenders',  1, true),
  ('c1000000-0002-0000-0000-000000000000', 'Chicken Burgers',  2, true),
  ('c1000000-0003-0000-0000-000000000000', 'Smash Burgers',    3, true),
  ('c1000000-0004-0000-0000-000000000000', 'Wraps',            4, true),
  ('c1000000-0005-0000-0000-000000000000', 'Tacos',            5, true),
  ('c1000000-0006-0000-0000-000000000000', 'Loaded Fries',     6, true),
  ('c1000000-0007-0000-0000-000000000000', 'Sides',            7, true),
  ('c1000000-0008-0000-0000-000000000000', 'Dips',             8, true);

-- ── Wings & Tenders ───────────────────────────
-- Sauce is selected in-app via the sauce picker
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0001-0000-0000-000000000000',
   'Wings / Tenders — Small',
   '6 wings or 3 tenders. Choose your sauce.',
   7.95, 1, true),
  ('c1000000-0001-0000-0000-000000000000',
   'Wings / Tenders — Large',
   '12 wings or 6 tenders. Choose your sauce.',
   13.95, 2, true);

-- ── Chicken Burgers ───────────────────────────
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0002-0000-0000-000000000000',
   'Honey Bun',
   'Brioche roll / fried chicken / hot honey glaze / ranch / apple slaw / pickle',
   11.95, 1, true),
  ('c1000000-0002-0000-0000-000000000000',
   'Hot Chicken Stack',
   'Nashville chicken / chipotle mayo / pickles / american cheese / brioche bread',
   11.95, 2, true),
  ('c1000000-0002-0000-0000-000000000000',
   'Crack Burger',
   'Fried chicken / brioche roll / crack sauce / cheddar cheese / pickle',
   10.95, 3, true);

-- ── Smash Burgers ─────────────────────────────
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0003-0000-0000-000000000000',
   'Bacon Double Cheese',
   '2 smash patties / american cheese / brown butter garlic mayo / crispy shallots / bacon crumb',
   11.95, 1, true),
  ('c1000000-0003-0000-0000-000000000000',
   'Smash or Pass',
   '2 smash patties / american cheese / chilli jam / yellow mustard',
   11.95, 2, true);

-- ── Wraps ─────────────────────────────────────
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0004-0000-0000-000000000000',
   'Ranch Me Up',
   'Chopped chicken / buttermilk ranch / smoked bacon / mature cheddar / crispy shallots / lettuce shred',
   11.95, 1, true),
  ('c1000000-0004-0000-0000-000000000000',
   'Spicy Chicken Wrap',
   'Nashville chicken / chipotle mayo / cheddar / shredded lettuce / red onion',
   11.95, 2, true);

-- ── Tacos ─────────────────────────────────────
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0005-0000-0000-000000000000',
   'Buffalo Taco',
   'Buffalo chicken / sour cream / crispy sage / crispy shallot / soft shell taco',
   10.95, 1, true);

-- ── Loaded Fries ──────────────────────────────
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0006-0000-0000-000000000000',
   'Dirty Kim',
   'Chicken chunks / korean glaze / spicy mayo / sliced chilli / spring onion',
   11.95, 1, true),
  ('c1000000-0006-0000-0000-000000000000',
   'Wing Slade Fries',
   'Chicken chunks / slade sauce / bacon / parmesan / fries / chillis / coriander / crispy shallots / lime',
   11.95, 2, true),
  ('c1000000-0006-0000-0000-000000000000',
   'Nashville Fries',
   'Hot chicken chunks / fries / cheddar cheese / chipotle drizzle / smoked paprika dust',
   11.95, 3, true);

-- ── Sides ─────────────────────────────────────
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0007-0000-0000-000000000000',
   'Seasoned Skin On Fries',
   'Simple, salty and crispy',
   4.25, 1, true),
  ('c1000000-0007-0000-0000-000000000000',
   'Halloumi Saganaki',
   'Squares of fried halloumi with a lemon honey drizzle, sesame and oregano',
   6.15, 2, true),
  ('c1000000-0007-0000-0000-000000000000',
   'Caesar Salad',
   'The ultimate girl dinner, now available as a side! (Add chicken for £9.95)',
   4.45, 3, true),
  ('c1000000-0007-0000-0000-000000000000',
   'Salt N Chilli Oil Fries',
   'Our signature fries tossed in chilli oil, seasoning, chilli parmesan and coriander',
   5.75, 4, true),
  ('c1000000-0007-0000-0000-000000000000',
   'Garlic Mac N Cheese Bites',
   'Our unbeatable mac n cheese bites with our garlic n herb butter and parmesan crumb',
   6.15, 5, true),
  ('c1000000-0007-0000-0000-000000000000',
   'Apple Slaw',
   'Our secret recipe — made fresh everyday',
   3.95, 6, true);

-- ── Dips ──────────────────────────────────────
INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0008-0000-0000-000000000000',
   'Dip — Small (2oz)',
   'Brown Butter G Mayo / Buttermilk Ranch / Crack Sauce',
   2.00, 1, true),
  ('c1000000-0008-0000-0000-000000000000',
   'Dip — Mega (8oz)',
   'Brown Butter G Mayo / Buttermilk Ranch / Crack Sauce',
   5.00, 2, true);
