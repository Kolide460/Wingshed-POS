-- ─────────────────────────────────────────────
-- Wingshed business hours + slot settings
-- 5–9pm Mon–Thu & Sun, 5–10pm Fri–Sat
-- 10-minute slots
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────

-- Clear existing hours
DELETE FROM business_hours;

-- day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday
INSERT INTO business_hours (day_of_week, open_time, close_time, is_open) VALUES
  (0, '17:00', '21:00', true),   -- Sunday
  (1, '17:00', '21:00', true),   -- Monday
  (2, '17:00', '21:00', true),   -- Tuesday
  (3, '17:00', '21:00', true),   -- Wednesday
  (4, '17:00', '21:00', true),   -- Thursday
  (5, '17:00', '22:00', true),   -- Friday
  (6, '17:00', '22:00', true);   -- Saturday

-- Update slot settings
INSERT INTO settings (key, value) VALUES
  ('slot_duration_minutes', '10'),
  ('lead_time_minutes', '20')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
