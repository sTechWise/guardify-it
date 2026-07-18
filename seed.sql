-- ==========================================
-- GUARDIFY IT — Seed Data
-- Run in Supabase SQL Editor after schema.sql
-- ==========================================

-- ==========================================
-- 1. CATEGORIES
-- ==========================================

INSERT INTO public.categories (name, slug, name_bengali, icon, description, product_count) VALUES
('Streaming', 'streaming', 'স্ট্রিমিং', '🎬', 'Premium streaming service subscriptions', 4),
('Productivity', 'productivity', 'প্রোডাক্টিভিটি', '⚡', 'Productivity and office suite subscriptions', 3),
('Security', 'security', 'সিকিউরিটি', '🛡️', 'Antivirus, VPN, and privacy tools', 3),
('AI Tools', 'ai-tools', 'এআই টুলস', '🤖', 'AI assistants, chatbots, and automation', 3),
('Cloud Storage', 'cloud-storage', 'ক্লাউড স্টোরেজ', '☁️', 'Cloud storage and backup solutions', 2),
('Design', 'design', 'ডিজাইন', '🎨', 'Design and creative tool subscriptions', 2)
ON CONFLICT (slug) DO NOTHING;


-- ==========================================
-- 2. PRODUCTS
-- ==========================================

-- We need category IDs, so let's use a CTE approach
DO $$
DECLARE
    v_streaming_id uuid;
    v_productivity_id uuid;
    v_security_id uuid;
    v_ai_id uuid;
    v_cloud_id uuid;
    v_design_id uuid;
BEGIN
    SELECT id INTO v_streaming_id FROM categories WHERE slug = 'streaming';
    SELECT id INTO v_productivity_id FROM categories WHERE slug = 'productivity';
    SELECT id INTO v_security_id FROM categories WHERE slug = 'security';
    SELECT id INTO v_ai_id FROM categories WHERE slug = 'ai-tools';
    SELECT id INTO v_cloud_id FROM categories WHERE slug = 'cloud-storage';
    SELECT id INTO v_design_id FROM categories WHERE slug = 'design';

    -- Streaming Products
    INSERT INTO products (title, title_bengali, description, description_bengali, price, sale_price, category_id, subscription_type, duration, stock_status, status, badge, rating, review_count, is_featured, is_new, image_url) VALUES
    ('Netflix Premium', 'নেটফ্লিক্স প্রিমিয়াম', '4K Ultra HD streaming with 4 screens. Watch on any device.', '৪কে আল্ট্রা এইচডি স্ট্রিমিং ৪টি স্ক্রিনে। যেকোনো ডিভাইসে দেখুন।', 650, 550, v_streaming_id, 'monthly', '1 Month', 'in_stock', 'active', 'Best Seller', 4.8, 245, true, false, 'https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=400'),
    ('Spotify Premium', 'স্পটিফাই প্রিমিয়াম', 'Ad-free music streaming with offline download and high quality audio.', 'বিজ্ঞাপনমুক্ত মিউজিক স্ট্রিমিং, অফলাইন ডাউনলোড ও হাই কোয়ালিটি অডিও।', 250, NULL, v_streaming_id, 'monthly', '1 Month', 'in_stock', 'active', NULL, 4.7, 189, true, false, 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400'),
    ('YouTube Premium', 'ইউটিউব প্রিমিয়াম', 'Ad-free YouTube with background play and YouTube Music.', 'বিজ্ঞাপনমুক্ত ইউটিউব, ব্যাকগ্রাউন্ড প্লে ও ইউটিউব মিউজিক।', 200, 170, v_streaming_id, 'monthly', '1 Month', 'in_stock', 'active', 'Popular', 4.6, 156, false, false, 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400'),
    ('Disney+ Hotstar', 'ডিজনি+ হটস্টার', 'Stream Disney, Marvel, Star Wars and exclusive originals.', 'ডিজনি, মার্ভেল, স্টার ওয়ার্স এবং এক্সক্লুসিভ অরিজিনাল দেখুন।', 350, 299, v_streaming_id, 'monthly', '1 Month', 'in_stock', 'active', NULL, 4.5, 98, false, true, 'https://images.unsplash.com/photo-1640499900704-b00dd6a1104c?w=400'),

    -- Productivity Products
    ('Microsoft 365', 'মাইক্রোসফট ৩৬৫', 'Full Office suite with 1TB OneDrive. Word, Excel, PowerPoint, Teams.', 'সম্পূর্ণ অফিস স্যুট ১টিবি ওয়ানড্রাইভসহ। ওয়ার্ড, এক্সেল, পাওয়ারপয়েন্ট, টিমস।', 450, NULL, v_productivity_id, 'monthly', '1 Month', 'in_stock', 'active', 'Top Rated', 4.9, 312, true, false, 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400'),
    ('Notion Pro', 'নোশন প্রো', 'All-in-one workspace for notes, projects, docs, and collaboration.', 'নোটস, প্রজেক্ট, ডক্স ও কোলাবোরেশনের জন্য অল-ইন-ওয়ান ওয়ার্কস্পেস।', 300, 250, v_productivity_id, 'monthly', '1 Month', 'in_stock', 'active', NULL, 4.7, 87, false, true, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400'),
    ('Grammarly Premium', 'গ্রামারলি প্রিমিয়াম', 'Advanced writing assistant with tone detection and plagiarism check.', 'উন্নত রাইটিং অ্যাসিস্ট্যান্ট, টোন ডিটেকশন ও প্লেজিয়ারিজম চেক।', 500, NULL, v_productivity_id, 'monthly', '1 Month', 'in_stock', 'active', NULL, 4.6, 134, false, false, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400'),

    -- Security Products
    ('NordVPN', 'নর্ডভিপিএন', 'Fast, secure VPN with 5500+ servers in 60 countries. No logs.', 'দ্রুত ও নিরাপদ ভিপিএন, ৬০টি দেশে ৫৫০০+ সার্ভার। নো লগস।', 350, 280, v_security_id, 'monthly', '1 Month', 'in_stock', 'active', 'Best Value', 4.8, 278, true, false, 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400'),
    ('Kaspersky Total Security', 'ক্যাসপারস্কি টোটাল সিকিউরিটি', 'Complete antivirus protection with VPN and password manager.', 'সম্পূর্ণ অ্যান্টিভাইরাস সুরক্ষা ভিপিএন ও পাসওয়ার্ড ম্যানেজারসহ।', 400, NULL, v_security_id, 'yearly', '1 Year', 'in_stock', 'active', NULL, 4.5, 67, false, false, 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400'),
    ('1Password', 'ওয়ানপাসওয়ার্ড', 'Secure password manager for all your accounts and devices.', 'আপনার সকল অ্যাকাউন্ট ও ডিভাইসের জন্য নিরাপদ পাসওয়ার্ড ম্যানেজার।', 180, 150, v_security_id, 'monthly', '1 Month', 'in_stock', 'active', 'New', 4.7, 45, false, true, 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400'),

    -- AI Tools
    ('ChatGPT Plus', 'চ্যাটজিপিটি প্লাস', 'GPT-4 access with faster responses, image generation, and priority access.', 'জিপিটি-৪ অ্যাক্সেস, দ্রুত রেসপন্স, ইমেজ জেনারেশন ও প্রায়োরিটি অ্যাক্সেস।', 1200, 999, v_ai_id, 'monthly', '1 Month', 'in_stock', 'active', 'Hot', 4.9, 456, true, false, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'),
    ('Midjourney', 'মিডজার্নি', 'AI image generation for stunning artwork and creative projects.', 'চমৎকার আর্টওয়ার্ক ও সৃজনশীল প্রজেক্টের জন্য এআই ইমেজ জেনারেশন।', 800, NULL, v_ai_id, 'monthly', '1 Month', 'in_stock', 'active', NULL, 4.8, 198, false, false, 'https://images.unsplash.com/photo-1686191128892-3b37add4a028?w=400'),
    ('GitHub Copilot', 'গিটহাব কোপাইলট', 'AI-powered code completion and suggestions for developers.', 'ডেভেলপারদের জন্য এআই-চালিত কোড কমপ্লিশন ও সাজেশন।', 600, 499, v_ai_id, 'monthly', '1 Month', 'in_stock', 'active', 'Dev Pick', 4.7, 167, false, true, 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400'),

    -- Cloud Storage
    ('Google One 2TB', 'গুগল ওয়ান ২টিবি', '2TB Google Drive storage with Google Photos and premium features.', '২টিবি গুগল ড্রাইভ স্টোরেজ, গুগল ফটোস ও প্রিমিয়াম ফিচার।', 500, NULL, v_cloud_id, 'yearly', '1 Year', 'in_stock', 'active', NULL, 4.6, 89, false, false, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400'),
    ('Dropbox Plus', 'ড্রপবক্স প্লাস', '2TB secure cloud storage with smart sync and remote wipe.', '২টিবি নিরাপদ ক্লাউড স্টোরেজ স্মার্ট সিঙ্ক ও রিমোট ওয়াইপসহ।', 550, 450, v_cloud_id, 'yearly', '1 Year', 'in_stock', 'active', NULL, 4.5, 56, false, false, 'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=400'),

    -- Design
    ('Canva Pro', 'ক্যানভা প্রো', 'Premium design tool with 100M+ templates, Brand Kit, and AI features.', 'প্রিমিয়াম ডিজাইন টুল ১০০এম+ টেমপ্লেট, ব্র্যান্ড কিট ও এআই ফিচারসহ।', 400, 350, v_design_id, 'monthly', '1 Month', 'in_stock', 'active', 'Popular', 4.8, 234, true, false, 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400'),
    ('Figma Professional', 'ফিগমা প্রফেশনাল', 'Collaborative design tool for teams. Unlimited projects and version history.', 'টিমের জন্য কোলাবোরেটিভ ডিজাইন টুল। আনলিমিটেড প্রজেক্ট ও ভার্সন হিস্টরি।', 700, NULL, v_design_id, 'monthly', '1 Month', 'in_stock', 'active', NULL, 4.7, 123, false, false, 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400');

END $$;

-- Verify
SELECT c.name AS category, COUNT(p.id) AS products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY c.name;
