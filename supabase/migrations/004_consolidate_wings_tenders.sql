-- ─────────────────────────────────────────────
-- Consolidate Wings & Tenders into two items
-- with size picked in-app (6/12 wings, 3/6 tenders)
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────

DELETE FROM menu_items
WHERE name IN ('Wings (6)', 'Wings (12)', 'Tenders (3)', 'Tenders (6)');

INSERT INTO menu_items (category_id, name, description, price, display_order, active) VALUES
  ('c1000000-0001-0000-0000-000000000000',
   'Wings',
   '6 or 12 wings. Choose your sauce.',
   7.95, 1, true),
  ('c1000000-0001-0000-0000-000000000000',
   'Tenders',
   '3 or 6 hand-breaded tenders. Choose your sauce.',
   7.95, 2, true);
