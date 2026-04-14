-- migrations/001_create_users.sql

CREATE TABLE IF NOT EXISTS users (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid  VARCHAR(255),
    email         VARCHAR(100),
    username      VARCHAR(50) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    name          VARCHAR(255),
    avatar_url    VARCHAR(500),
    phone_number  VARCHAR(20),
    provider      VARCHAR(50),
    role          VARCHAR(50),
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index để tìm user theo username nhanh hơn (dùng cho login)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index phụ cho email nếu sau này cần tìm theo email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Seed một user để test (password: TestPass@123)
-- Hash được generate bằng bcrypt cost=12
INSERT INTO users (username, password)
VALUES (
    'testuser',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RGQO6AMQK'
)
ON CONFLICT (username) DO NOTHING;