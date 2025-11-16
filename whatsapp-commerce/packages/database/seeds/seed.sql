-- Biashara WhatsApp Commerce Platform - Seed Data
-- Sample vendors, categories, and products for testing

-- Categories
INSERT INTO categories (name, slug, description, icon, display_order, is_active) VALUES
  ('Fashion & Clothing', 'fashion', 'Clothes, shoes, accessories', '👗', 1, true),
  ('Electronics', 'electronics', 'Phones, computers, gadgets', '📱', 2, true),
  ('Food & Groceries', 'food', 'Fresh food, packaged goods', '🍕', 3, true),
  ('Fresh Produce', 'produce', 'Fruits, vegetables, farm products', '🌾', 4, true),
  ('Beauty & Personal Care', 'beauty', 'Cosmetics, skincare, haircare', '💄', 5, true),
  ('Home & Living', 'home', 'Furniture, decor, appliances', '🏠', 6, true),
  ('Crafts & Handmade', 'crafts', 'Artisan products, handmade goods', '🎨', 7, true);

-- Sample Vendors
INSERT INTO vendors (business_name, owner_name, phone_number, email, description, category, county, town, verified, subscription_tier) VALUES
  ('Mama Ngina Fashion', 'Grace Ngina', '+254712345678', 'grace@mamangina.com', 'Quality African fashion and modern wear', 'fashion', 'Nairobi', 'Nairobi CBD', true, 'pro'),
  ('TechHub Nairobi', 'James Omondi', '+254723456789', 'james@techhub.co.ke', 'Affordable electronics and phones', 'electronics', 'Nairobi', 'Westlands', true, 'pro'),
  ('Fresh Farms KE', 'Mary Wanjiru', '+254734567890', 'mary@freshfarms.co.ke', 'Farm-fresh produce delivered daily', 'produce', 'Kiambu', 'Kiambu Town', true, 'free'),
  ('Bella Beauty', 'Sarah Akinyi', '+254745678901', 'sarah@bellabeau ty.com', 'Beauty products and cosmetics', 'beauty', 'Mombasa', 'Nyali', false, 'free');

-- Sample Products
-- Fashion Products
INSERT INTO products (vendor_id, name, description, price, stock_quantity, images, is_featured) SELECT
  v.id,
  'Kitenge Dress',
  'Beautiful African print dress, available in multiple sizes',
  2500,
  15,
  ARRAY['https://example.com/kitenge.jpg']::text[],
  true
FROM vendors v WHERE v.business_name = 'Mama Ngina Fashion';

INSERT INTO products (vendor_id, name, description, price, stock_quantity, images) SELECT
  v.id,
  'Ankara Shirt',
  'Stylish ankara print shirt for men',
  1800,
  20,
  ARRAY['https://example.com/ankara.jpg']::text[]
FROM vendors v WHERE v.business_name = 'Mama Ngina Fashion';

-- Electronics
INSERT INTO products (vendor_id, name, description, price, stock_quantity, images, is_featured) SELECT
  v.id,
  'Samsung Galaxy A14',
  '6.6" display, 64GB storage, 4GB RAM, dual SIM',
  14500,
  8,
  ARRAY['https://example.com/samsung-a14.jpg']::text[],
  true
FROM vendors v WHERE v.business_name = 'TechHub Nairobi';

INSERT INTO products (vendor_id, name, description, price, stock_quantity, images) SELECT
  v.id,
  'Infinix Hot 12',
  '6.82" display, 128GB storage, triple camera',
  12000,
  12,
  ARRAY['https://example.com/infinix.jpg']::text[]
FROM vendors v WHERE v.business_name = 'TechHub Nairobi';

-- Fresh Produce
INSERT INTO products (vendor_id, name, description, price, stock_quantity, images, is_featured) SELECT
  v.id,
  'Tomatoes (1kg)',
  'Fresh farm tomatoes, locally grown',
  80,
  100,
  ARRAY['https://example.com/tomatoes.jpg']::text[],
  true
FROM vendors v WHERE v.business_name = 'Fresh Farms KE';

INSERT INTO products (vendor_id, name, description, price, stock_quantity, images) SELECT
  v.id,
  'Sukuma Wiki Bundle',
  'Fresh kale, perfect for traditional meals',
  40,
  80,
  ARRAY['https://example.com/sukuma.jpg']::text[]
FROM vendors v WHERE v.business_name = 'Fresh Farms KE';

-- Beauty Products
INSERT INTO products (vendor_id, name, description, price, stock_quantity, images) SELECT
  v.id,
  'Shea Butter Cream',
  'Natural shea butter moisturizer, 250ml',
  450,
  30,
  ARRAY['https://example.com/shea.jpg']::text[]
FROM vendors v WHERE v.business_name = 'Bella Beauty';

COMMIT;
