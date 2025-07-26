-- SmarTalk 示例数据
-- 用于开发和测试的种子数据

-- 插入示例故事
INSERT INTO stories (id, title, description, category, difficulty, duration, thumbnail_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'A Day at the Coffee Shop',
    'Learn everyday English through a typical coffee shop experience. Practice ordering, small talk, and common expressions.',
    'daily-life',
    'beginner',
    300,
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Job Interview Success',
    'Master professional English for job interviews. Learn how to present yourself confidently and answer common questions.',
    'business',
    'intermediate',
    450,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Travel Adventures',
    'Navigate travel situations with confidence. From booking hotels to asking for directions, master travel English.',
    'travel',
    'intermediate',
    400,
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Medical Emergency',
    'Learn essential medical vocabulary and phrases for emergency situations and doctor visits.',
    'health',
    'advanced',
    500,
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
);

-- 插入示例视频
INSERT INTO videos (id, story_id, title, description, type, url, duration, thumbnail_url, "order") VALUES
-- Coffee Shop Story Videos
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Coffee Shop Context',
    'Setting the scene at a busy coffee shop',
    'context',
    'https://example.com/videos/coffee-context.mp4',
    60,
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300',
    1
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Ordering Politely',
    'How to order your coffee politely',
    'option_a',
    'https://example.com/videos/coffee-polite.mp4',
    45,
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300',
    2
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'Ordering Casually',
    'How to order your coffee casually',
    'option_b',
    'https://example.com/videos/coffee-casual.mp4',
    45,
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300',
    3
),

-- Job Interview Story Videos
(
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'Interview Context',
    'Preparing for a job interview',
    'context',
    'https://example.com/videos/interview-context.mp4',
    90,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    1
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'Confident Introduction',
    'How to introduce yourself confidently',
    'option_a',
    'https://example.com/videos/interview-confident.mp4',
    60,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    2
),
(
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    'Humble Introduction',
    'How to introduce yourself humbly',
    'option_b',
    'https://example.com/videos/interview-humble.mp4',
    60,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    3
);

-- 插入示例关键词
INSERT INTO keywords (id, word, definition, pronunciation, examples, difficulty, category) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    'order',
    'To request something, especially food or drink in a restaurant',
    '/ˈɔːrdər/',
    ARRAY['I would like to order a coffee', 'Can I order the special?', 'She ordered a sandwich'],
    'beginner',
    'daily-life'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    'polite',
    'Having good manners; respectful and considerate',
    '/pəˈlaɪt/',
    ARRAY['Please be polite to the customers', 'It is polite to say thank you', 'She gave a polite smile'],
    'beginner',
    'social'
),
(
    '770e8400-e29b-41d4-a716-446655440003',
    'confident',
    'Feeling sure about your abilities or having trust in people, plans, or the future',
    '/ˈkɑːnfɪdənt/',
    ARRAY['She felt confident about the interview', 'Be confident in your abilities', 'He gave a confident presentation'],
    'intermediate',
    'business'
),
(
    '770e8400-e29b-41d4-a716-446655440004',
    'emergency',
    'A serious, unexpected, and often dangerous situation requiring immediate action',
    '/ɪˈmɜːrdʒənsi/',
    ARRAY['Call 911 in case of emergency', 'This is an emergency situation', 'Emergency services arrived quickly'],
    'advanced',
    'health'
),
(
    '770e8400-e29b-41d4-a716-446655440005',
    'reservation',
    'An arrangement to have something kept for you',
    '/ˌrezərˈveɪʃən/',
    ARRAY['I have a reservation for two', 'Make a hotel reservation', 'Cancel the reservation'],
    'intermediate',
    'travel'
);

-- 关联故事和关键词
INSERT INTO story_keywords (story_id, keyword_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004');

-- 插入示例成就
INSERT INTO achievements (id, title, description, icon, type, criteria, reward) VALUES
(
    '880e8400-e29b-41d4-a716-446655440001',
    'First Steps',
    'Complete your first story',
    '🎯',
    'story_completion',
    '{"count": 1}',
    '{"type": "badge", "value": "first_story"}'
),
(
    '880e8400-e29b-41d4-a716-446655440002',
    'Story Master',
    'Complete 10 stories',
    '📚',
    'story_completion',
    '{"count": 10}',
    '{"type": "badge", "value": "story_master"}'
),
(
    '880e8400-e29b-41d4-a716-446655440003',
    'Word Collector',
    'Learn 50 new keywords',
    '📝',
    'keyword_mastery',
    '{"count": 50}',
    '{"type": "badge", "value": "word_collector"}'
),
(
    '880e8400-e29b-41d4-a716-446655440004',
    'Dedicated Learner',
    'Spend 10 hours learning',
    '⏰',
    'time_spent',
    '{"minutes": 600}',
    '{"type": "badge", "value": "dedicated_learner"}'
),
(
    '880e8400-e29b-41d4-a716-446655440005',
    'English Explorer',
    'Complete stories from 5 different categories',
    '🌍',
    'story_completion',
    '{"categories": 5}',
    '{"type": "unlock", "value": "advanced_content"}'
);
