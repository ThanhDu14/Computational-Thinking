-- Kích hoạt extension để tự động sinh UUID (thay cho NEWID() của SQL Server)
create extension IF not exists "uuid-ossp";

create table Users (
  user_id UUID primary key default uuid_generate_v4 (),

  firebase_uid VARCHAR(255) unique,

  email VARCHAR(100) unique,
  username VARCHAR(50) unique,
  password VARCHAR(255),

  name VARCHAR(255) not null,
  provider VARCHAR(50) not null,
  role VARCHAR(50) default 'tourist',

  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

create table Locations (
  location_id UUID primary key default uuid_generate_v4 (),

  name VARCHAR(255) not null,
  description TEXT,
  address TEXT,
  city VARCHAR(100),

  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),

  duration_minutes INT,
  opening_hours_json TEXT,

  rating FLOAT,
  count_rating INT
);


create table LocationImages (
  location_id UUID not null references Locations (location_id) on delete CASCADE,
  image TEXT not null,
  primary key (location_id, image)
);

create table Categories (
  category_id UUID primary key default uuid_generate_v4 (),
  category_name VARCHAR(255) not null,
  description VARCHAR(255) not nullf
);

create table LocationCategories (
  location_id UUID references Locations (location_id) on delete CASCADE,
  category_id UUID references Categories (category_id) on delete CASCADE,
  primary key (location_id, category_id)
);

create table LocationDistanceMatrix (
  origin_id UUID references Locations (location_id) on delete CASCADE,
  destination_id UUID references Locations (location_id) on delete CASCADE,

  travel_by VARCHAR(50),
  distance_m INT,
  duration_min INT,

  primary key (origin_id, destination_id, travel_by)
);

create table Wishlist (
  user_id UUID not null references Users (user_id) on delete CASCADE,
  location_id UUID not null references Locations (location_id) on delete CASCADE,
  primary key (user_id, location_id)
);

create table Plans (
  plan_id UUID primary key default uuid_generate_v4 (),
  user_id UUID references Users (user_id) on delete CASCADE,
  start_date DATE,
  end_date DATE,
  generation_source VARCHAR(50)
);

create table PlanDay (
  plan_day_id UUID primary key default uuid_generate_v4 (),
  plan_id UUID references Plans (plan_id) on delete CASCADE,
  day_seq INT,
  date DATE
);

create table PlanItem (
  item_id UUID primary key default uuid_generate_v4 (),
  day_id UUID references PlanDay (plan_day_id) on delete CASCADE,
  location_id UUID references Locations (location_id),
  start_time TIME,
  end_time TIME,
  order_index INT
);
drop table PlanItem

create table PlanTemplate (
  template_id UUID primary key default uuid_generate_v4 (),
  theme VARCHAR(255),
  target_audience VARCHAR(255),
  total_days INT,
  content_json TEXT
);

create table ImageUpload (
  image_id UUID primary key default uuid_generate_v4 (),
  user_id UUID references Users (user_id) on delete CASCADE,
  image_url VARCHAR(500),
  status VARCHAR(50),
  raw_exif_data TEXT,
  raw_ml_response TEXT,
  created_at TIMESTAMP default NOW()
);

create table ImageIdentifiedLocation (
  identification_id UUID primary key default uuid_generate_v4 (),
  image_id UUID references ImageUpload (image_id) on delete CASCADE,

  detected_landmark_name VARCHAR(255),
  location_id UUID references Locations (location_id),
  
  confidence_score FLOAT,
  detected_by VARCHAR(50),
  is_training_data BOOLEAN default false
);

create table UserTripRequest (
  request_id UUID primary key default uuid_generate_v4 (),
  user_id UUID references Users (user_id) on delete CASCADE,

  destination_text TEXT,
  parameters_json TEXT,

  created_at TIMESTAMP default NOW()
);

create table Review (
  review_id UUID primary key default uuid_generate_v4 (),
  user_id UUID references Users (user_id) on delete CASCADE,
  location_id UUID references Locations (location_id) on delete CASCADE,

  rating FLOAT,
  comment TEXT,
  created_at TIMESTAMP default NOW()
);

create table ReviewImages (
  review_id UUID not null references Review (review_id) on delete CASCADE,
  image TEXT not null,
  primary key (review_id, image)
);

alter table Users
add column phone_number VARCHAR(20) unique,
add column avatar_url TEXT,
add column preferences JSONB default '[]'::jsonb;

-- 1. Thêm 2 cột còn thiết
alter table Users
add column display_name VARCHAR(100) default '',
add column bio TEXT default '';

-- 2. Đổi tên 2 cột bị lệch để Gorm tìm thấy
alter table Users
rename column avatar_url to avatar;

alter table Users
rename column preferences to travel_preferences;

-- 3. Fix lỗi Bug tạo acc mới bị chặn vì trùng số điện thoại ảo ""
alter table Users
drop constraint IF exists users_phone_number_key;
