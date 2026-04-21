-- Kích hoạt extension để tự động sinh UUID (thay cho NEWID() của SQL Server)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Management
CREATE TABLE Users (
    -- Dữ liệu định danh (Giữ nguyên UUID để bảo vệ các bảng con)
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    
    -- Dữ liệu từ Firebase (Cửa 1) - Có thể NULL
    firebase_uid VARCHAR(255) UNIQUE,
    email VARCHAR(100) UNIQUE,
    
    -- Dữ liệu Tự code Auth Local (Cửa 2) - Có thể NULL
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    
    -- Dữ liệu dùng chung (Bắt buộc phải có theo struct Go)
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    role VARCHAR(50) DEFAULT 'tourist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Location Data
CREATE TABLE Locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    name VARCHAR(255) NOT NULL, 
    latitude DECIMAL(9,6), 
    longitude DECIMAL(9,6), 
    duration_minutes INT,
    opening_hours_json TEXT,
    information TEXT,
    rating FLOAT,
    count_rating INT
);

CREATE TABLE Categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE LocationCategories(
    location_id UUID REFERENCES Locations(location_id) ON DELETE CASCADE, 
    category_id UUID REFERENCES Categories(category_id) ON DELETE CASCADE, 
    PRIMARY KEY(location_id, category_id)
);

-- 3. Distance Matrix
CREATE TABLE LocationDistanceMatrix (
    origin_id UUID REFERENCES Locations(location_id) ON DELETE CASCADE, 
    destination_id UUID REFERENCES Locations(location_id) ON DELETE CASCADE, 
    travel_by VARCHAR(50), 
    distance_m INT, 
    duration_min INT, 
    PRIMARY KEY (origin_id, destination_id, travel_by) 
);

-- 4. Planning Tables
CREATE TABLE Plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(user_id) ON DELETE CASCADE, 
    start_date DATE,
    end_date DATE, 
    generation_source VARCHAR(50) 
);

CREATE TABLE PlanDay (
    plan_day_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    plan_id UUID REFERENCES Plans(plan_id) ON DELETE CASCADE, 
    day_seq INT, 
    date DATE 
);

CREATE TABLE PlanItem (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    day_id UUID REFERENCES PlanDay(plan_day_id) ON DELETE CASCADE, 
    location_id UUID REFERENCES Locations(location_id),
    start_time TIME, 
    end_time TIME, 
    order_index INT 
);

-- 5. Templates
CREATE TABLE PlanTemplate (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme VARCHAR(255), 
    target_audience VARCHAR(255),
    total_days INT, 
    content_json TEXT 
);

-- 6. Image Processing
CREATE TABLE ImageUpload (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    user_id UUID REFERENCES Users(user_id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    status VARCHAR(50), 
    raw_exif_data TEXT, 
    raw_ml_response TEXT, 
    created_at TIMESTAMP DEFAULT NOW() 
);

CREATE TABLE ImageIdentifiedLocation (
    identification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    image_id UUID REFERENCES ImageUpload(image_id) ON DELETE CASCADE, 
    detected_landmark_name VARCHAR(255), 
    location_id UUID REFERENCES Locations(location_id),
    confidence_score FLOAT, 
    detected_by VARCHAR(50), 
    is_training_data BOOLEAN DEFAULT FALSE 
);

-- 7. Manual Requests
CREATE TABLE UserTripRequest (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    user_id UUID REFERENCES Users(user_id) ON DELETE CASCADE, 
    destination_text TEXT, 
    parameters_json TEXT, 
    created_at TIMESTAMP DEFAULT NOW() 
);

CREATE TABLE Review (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    user_id UUID REFERENCES Users(user_id) ON DELETE CASCADE, 
    location_id UUID REFERENCES Locations(location_id) ON DELETE CASCADE,
    rating FLOAT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE Users 
ADD COLUMN phone_number VARCHAR(20) UNIQUE,
ADD COLUMN avatar_url TEXT,
ADD COLUMN preferences JSONB DEFAULT '[]'::jsonb;

ALTER TABLE Locations  
ADD COLUMN description TEXT;

ALTER TABLE Locations
RENAME COLUMN information TO address; 

-- 1. Thêm 2 cột còn thiết
ALTER TABLE Users 
ADD COLUMN display_name VARCHAR(100) DEFAULT '',
ADD COLUMN bio TEXT DEFAULT '';

-- 2. Đổi tên 2 cột bị lệch để Gorm tìm thấy
ALTER TABLE Users 
RENAME COLUMN avatar_url TO avatar;

ALTER TABLE Users 
RENAME COLUMN preferences TO travel_preferences;

-- 3. Fix lỗi Bug tạo acc mới bị chặn vì trùng số điện thoại ảo ""
ALTER TABLE Users 
DROP CONSTRAINT IF EXISTS users_phone_number_key;

ALTER TABLE Locations 
ADD COLUMN City VARCHAR(100);