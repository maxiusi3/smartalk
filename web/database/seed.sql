-- SmarTalk 示例数据
-- 插入测试数据以支持 MVP 功能

-- 插入兴趣主题
INSERT INTO interests (id, name, theme, description, icon_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', '旅行英语', 'travel', '学习旅行中常用的英语表达，包括机场、酒店、餐厅等场景', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100'),
('550e8400-e29b-41d4-a716-446655440002', '电影对话', 'movie', '通过经典电影对话学习自然的英语表达和情感交流', 'https://images.unsplash.com/photo-1489599735734-79b4f9b9b5b8?w=100'),
('550e8400-e29b-41d4-a716-446655440003', '职场沟通', 'workplace', '掌握职场环境中的专业英语沟通技巧', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=100')
ON CONFLICT (id) DO NOTHING;

-- 插入故事/剧集
INSERT INTO stories (id, title, description, category, difficulty, duration, thumbnail_url, video_url, subtitle_url, keywords, interest_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', '机场奇遇记', '在机场遇到的各种情况和对话，学习旅行必备英语', 'travel', 'beginner', 180, 
 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
 '/subtitles/airport-adventure.srt',
 ARRAY['check-in', 'boarding', 'luggage', 'departure', 'arrival'],
 '550e8400-e29b-41d4-a716-446655440001'),

('660e8400-e29b-41d4-a716-446655440002', '咖啡店邂逅', '在咖啡店的浪漫邂逅，学习日常交流英语', 'movie', 'intermediate', 240,
 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
 '/subtitles/coffee-shop-romance.srt',
 ARRAY['order', 'coffee', 'conversation', 'meeting', 'romance'],
 '550e8400-e29b-41d4-a716-446655440002'),

('660e8400-e29b-41d4-a716-446655440003', '项目会议', '参加项目会议的专业对话，学习商务英语', 'workplace', 'advanced', 300,
 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
 '/subtitles/project-meeting.srt',
 ARRAY['presentation', 'deadline', 'budget', 'teamwork', 'strategy'],
 '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 插入关键词（每个故事15个词汇）
-- 旅行主题关键词
INSERT INTO keywords (id, word, translation, pronunciation, audio_url, example_sentence, story_id, timestamp_start, timestamp_end, difficulty_level) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'check-in', '办理登机手续', '/tʃek ɪn/', '/audio/check-in.mp3', 'I need to check in for my flight.', '660e8400-e29b-41d4-a716-446655440001', 10, 15, 1),
('770e8400-e29b-41d4-a716-446655440002', 'boarding', '登机', '/ˈbɔːrdɪŋ/', '/audio/boarding.mp3', 'Boarding will begin in 30 minutes.', '660e8400-e29b-41d4-a716-446655440001', 25, 30, 1),
('770e8400-e29b-41d4-a716-446655440003', 'luggage', '行李', '/ˈlʌɡɪdʒ/', '/audio/luggage.mp3', 'Where can I collect my luggage?', '660e8400-e29b-41d4-a716-446655440001', 45, 50, 1),
('770e8400-e29b-41d4-a716-446655440004', 'departure', '出发', '/dɪˈpɑːrtʃər/', '/audio/departure.mp3', 'The departure time is 3 PM.', '660e8400-e29b-41d4-a716-446655440001', 60, 65, 1),
('770e8400-e29b-41d4-a716-446655440005', 'arrival', '到达', '/əˈraɪvəl/', '/audio/arrival.mp3', 'What is the arrival gate?', '660e8400-e29b-41d4-a716-446655440001', 80, 85, 1),
('770e8400-e29b-41d4-a716-446655440006', 'passport', '护照', '/ˈpæspɔːrt/', '/audio/passport.mp3', 'Please show me your passport.', '660e8400-e29b-41d4-a716-446655440001', 100, 105, 1),
('770e8400-e29b-41d4-a716-446655440007', 'security', '安检', '/sɪˈkjʊrəti/', '/audio/security.mp3', 'You need to go through security.', '660e8400-e29b-41d4-a716-446655440001', 120, 125, 1),
('770e8400-e29b-41d4-a716-446655440008', 'gate', '登机口', '/ɡeɪt/', '/audio/gate.mp3', 'Your gate number is B12.', '660e8400-e29b-41d4-a716-446655440001', 140, 145, 1),
('770e8400-e29b-41d4-a716-446655440009', 'delay', '延误', '/dɪˈleɪ/', '/audio/delay.mp3', 'There is a 30-minute delay.', '660e8400-e29b-41d4-a716-446655440001', 160, 165, 2),
('770e8400-e29b-41d4-a716-446655440010', 'terminal', '航站楼', '/ˈtɜːrmɪnəl/', '/audio/terminal.mp3', 'Which terminal is my flight?', '660e8400-e29b-41d4-a716-446655440001', 170, 175, 2),

-- 电影主题关键词（部分）
('770e8400-e29b-41d4-a716-446655440011', 'order', '点餐', '/ˈɔːrdər/', '/audio/order.mp3', 'I would like to order a coffee.', '660e8400-e29b-41d4-a716-446655440002', 15, 20, 1),
('770e8400-e29b-41d4-a716-446655440012', 'coffee', '咖啡', '/ˈkɔːfi/', '/audio/coffee.mp3', 'This coffee smells amazing.', '660e8400-e29b-41d4-a716-446655440002', 35, 40, 1),
('770e8400-e29b-41d4-a716-446655440013', 'conversation', '对话', '/ˌkɑːnvərˈseɪʃən/', '/audio/conversation.mp3', 'We had a wonderful conversation.', '660e8400-e29b-41d4-a716-446655440002', 60, 65, 2),
('770e8400-e29b-41d4-a716-446655440014', 'meeting', '见面', '/ˈmiːtɪŋ/', '/audio/meeting.mp3', 'Nice meeting you here.', '660e8400-e29b-41d4-a716-446655440002', 90, 95, 1),
('770e8400-e29b-41d4-a716-446655440015', 'romance', '浪漫', '/roʊˈmæns/', '/audio/romance.mp3', 'There was romance in the air.', '660e8400-e29b-41d4-a716-446655440002', 120, 125, 3),

-- 职场主题关键词（部分）
('770e8400-e29b-41d4-a716-446655440016', 'presentation', '演示', '/ˌpriːzenˈteɪʃən/', '/audio/presentation.mp3', 'The presentation was excellent.', '660e8400-e29b-41d4-a716-446655440003', 20, 25, 2),
('770e8400-e29b-41d4-a716-446655440017', 'deadline', '截止日期', '/ˈdedlaɪn/', '/audio/deadline.mp3', 'We need to meet the deadline.', '660e8400-e29b-41d4-a716-446655440003', 50, 55, 2),
('770e8400-e29b-41d4-a716-446655440018', 'budget', '预算', '/ˈbʌdʒɪt/', '/audio/budget.mp3', 'What is our budget for this project?', '660e8400-e29b-41d4-a716-446655440003', 80, 85, 2),
('770e8400-e29b-41d4-a716-446655440019', 'teamwork', '团队合作', '/ˈtiːmwɜːrk/', '/audio/teamwork.mp3', 'Good teamwork is essential.', '660e8400-e29b-41d4-a716-446655440003', 110, 115, 2),
('770e8400-e29b-41d4-a716-446655440020', 'strategy', '策略', '/ˈstrætədʒi/', '/audio/strategy.mp3', 'We need a new marketing strategy.', '660e8400-e29b-41d4-a716-446655440003', 140, 145, 3)
ON CONFLICT (id) DO NOTHING;

-- 插入 VTPR 练习视频片段（每个关键词4个选项，1个正确3个错误）
INSERT INTO keyword_video_clips (id, keyword_id, video_url, is_correct, description, thumbnail_url, duration) VALUES
-- check-in 的选项
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '/videos/clips/check-in-correct.mp4', true, '机场办理登机手续场景', '/thumbnails/check-in-correct.jpg', 10),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '/videos/clips/restaurant-scene.mp4', false, '餐厅用餐场景', '/thumbnails/restaurant-scene.jpg', 8),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '/videos/clips/shopping-scene.mp4', false, '购物场景', '/thumbnails/shopping-scene.jpg', 12),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '/videos/clips/office-scene.mp4', false, '办公室场景', '/thumbnails/office-scene.jpg', 9),

-- coffee 的选项
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440012', '/videos/clips/coffee-correct.mp4', true, '咖啡店点咖啡场景', '/thumbnails/coffee-correct.jpg', 8),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440012', '/videos/clips/tea-scene.mp4', false, '喝茶场景', '/thumbnails/tea-scene.jpg', 7),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440012', '/videos/clips/juice-scene.mp4', false, '喝果汁场景', '/thumbnails/juice-scene.jpg', 6),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440012', '/videos/clips/water-scene.mp4', false, '喝水场景', '/thumbnails/water-scene.jpg', 5)
ON CONFLICT (id) DO NOTHING;

-- 创建示例用户（匿名用户）
INSERT INTO user_profiles (id, device_id, preferred_language, selected_interest_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'device_12345', 'zh-CN', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (device_id) DO NOTHING;
