CREATE DATABASE DuLich
GO
USE DuLich
Go
-- 1. User Management
CREATE TABLE Users (
    user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    email NVARCHAR(255) UNIQUE NOT NULL,
    preferences NVARCHAR(MAX) 
)
GO

-- 2. Location Data
CREATE TABLE Locations (
    location_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    name NVARCHAR(255) NOT NULL, 
    category NVARCHAR(100), 
    latitude DECIMAL(9,6), 
    longitude DECIMAL(9,6), 
    duration_minutes INT,
    opening_hours_json NVARCHAR(MAX),
    information NVARCHAR(MAX),
    rating FLOAT,
    count_rating INT
)
GO

-- 3. Distance Matrix
CREATE TABLE LocationDistanceMatrix (
    origin_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Locations(location_id), 
    destination_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Locations(location_id), 
    travel_by NVARCHAR(50), 
    distance_m INT, 
    duration_min INT, 
    PRIMARY KEY (origin_id, destination_id, travel_by) 
)
GO

-- 4. Planning Tables
CREATE TABLE Plans (
    plan_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id), 
    start_date DATE,
    end_date DATE, 
    generation_source NVARCHAR(50) 
)
GO

CREATE TABLE PlanDay (
    plan_day_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    plan_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Plans(plan_id), 
    day_seq INT, 
    [date] DATE 
)
GO

CREATE TABLE PlanItem (
    item_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    day_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES PlanDay(plan_day_id), 
    location_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Locations(location_id),
    start_time TIME, 
    end_time TIME, 
    order_index INT 
)
GO

-- 5. Templates
CREATE TABLE PlanTemplate (
    template_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    theme NVARCHAR(255), 
    target_audience NVARCHAR(255),
    total_days INT, 
    content_json NVARCHAR(MAX) 
)
GO

-- 6. Image Processing (The "Raw Vault" Strategy)
CREATE TABLE ImageUpload (
    image_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id),
    image_url NVARCHAR(500),
    [status] NVARCHAR(50), -- PENDING, ML_PROCESSING
    raw_exif_data NVARCHAR(MAX), 
    raw_ml_response NVARCHAR(MAX), 
    created_at DATETIME DEFAULT GETDATE() -- 
)
GO

CREATE TABLE ImageIdentifiedLocation (
    identification_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    image_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES ImageUpload(image_id), 
    detected_landmark_name NVARCHAR(255), 
    location_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Locations(location_id),
    confidence_score FLOAT, 
    detected_by NVARCHAR(50), 
    is_training_data BIT DEFAULT 0 -- 
)
GO

-- 7. Manual Requests
CREATE TABLE UserTripRequest (
    request_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id), 
    destination_text NVARCHAR(MAX), 
    parameters_json NVARCHAR(MAX), 
    created_at DATETIME DEFAULT GETDATE() 
);
GO

CREATE TABLE Review (
    review_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(user_id), 
    location_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Locations(location_id),
    rating FLOAT,
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
)
GO

ALTER TABLE Users
ADD COLUMN phone_number VARCHAR(20) UNIQUE,
ADD COLUMN avatar_url TEXT,
ADD COLUMN preferences JSONB DEFAULT '[]'::jsonb; -- (Hoặc dùng JSONB thay cho TEXT nếu bạn muốn lưu dạng mảng/object)
