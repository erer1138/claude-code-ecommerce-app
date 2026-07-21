-- =============================================
-- Sample Data for E-Commerce Database
-- =============================================

-- 1. categories
INSERT INTO public.categories (name) VALUES
('สมาร์ทโฟน'),
('แล็ปท็อป'),
('หูฟัง'),
('แท็บเล็ต'),
('อุปกรณ์เสริม');

-- 2. products
INSERT INTO public.products (name, description, price, category_id) VALUES
('iPhone 16 Pro', 'สมาร์ทโฟน Apple จอ 6.3 นิ้ว ชิป A18 Pro', 45900.00, 1),
('Samsung Galaxy S25', 'สมาร์ทโฟน Samsung จอ 6.2 นิ้ว ชิป Snapdragon 8 Elite', 32900.00, 1),
('MacBook Air M3', 'แล็ปท็อป Apple จอ 15 นิ้ว RAM 16GB SSD 512GB', 44900.00, 2),
('AirPods Pro 2', 'หูฟังไร้สาย Apple ตัดเสียงรบกวน USB-C', 8990.00, 3),
('iPad Air M2', 'แท็บเล็ต Apple จอ 13 นิ้ว ชิป M2', 33900.00, 4);

-- 3. product_images
INSERT INTO public.product_images (product_id, image_name) VALUES
(1, 'iphone16pro-front.jpg'),
(1, 'iphone16pro-back.jpg'),
(2, 'galaxy-s25-front.jpg'),
(3, 'macbook-air-m3-silver.jpg'),
(4, 'airpods-pro2-case.jpg');

-- 4. customers
-- user_id ต้องอ้างถึง auth.users(id) จริง (unique ต่อผู้ใช้ 1 คน)
-- จึงสร้างได้แค่ลูกค้า 1 รายที่ผูกกับ auth user นี้เท่านั้น
INSERT INTO public.customers (user_id, name, address, phone) VALUES
('1e9c1050-1880-41de-9d8f-da54a1477f64', 'สมชาย ใจดี', '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', '081-234-5678');

-- 5. orders
-- customer_id ทั้งหมดอ้างถึงลูกค้ารายเดียวข้างต้น (id = 1)
-- status ต้องเป็นค่าใน enum order_status จริง: pending, paid, shipped, delivered, cancelled
INSERT INTO public.orders (ordered_at, customer_id, status, total_amount) VALUES
('2026-06-01 09:30:00', 1, 'delivered', 100790.00),
('2026-06-01 14:15:00', 1, 'delivered', 53890.00),
('2026-06-02 10:00:00', 1, 'paid', 41890.00),
('2026-06-02 16:45:00', 1, 'shipped', 78800.00),
('2026-06-03 08:20:00', 1, 'paid', 79800.00);

-- 6. order_items (10 rows)
INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES
-- Order #1: iPhone 16 Pro x2 + AirPods Pro 2 x1 = 100,790
(1, 1, 2, 45900.00),
(1, 4, 1, 8990.00),
-- Order #2: MacBook Air M3 x1 + AirPods Pro 2 x1 = 53,890
(2, 3, 1, 44900.00),
(2, 4, 1, 8990.00),
-- Order #3: Galaxy S25 x1 + AirPods Pro 2 x1 = 41,890
(3, 2, 1, 32900.00),
(3, 4, 1, 8990.00),
-- Order #4: MacBook Air M3 x1 + iPad Air M2 x1 = 78,800
(4, 3, 1, 44900.00),
(4, 5, 1, 33900.00),
-- Order #5: iPhone 16 Pro x1 + iPad Air M2 x1 = 79,800
(5, 1, 1, 45900.00),
(5, 5, 1, 33900.00);
