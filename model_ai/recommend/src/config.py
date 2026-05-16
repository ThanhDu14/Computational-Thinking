import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

class Settings:

    TRANSPORTATION_RADIUS = {
        "car": 30.0,
        "motorbike": 50.0,
        "public_transport": 10.0,
    }

    HIDDEN_GEM_MAX_REVIEWS = 200
    HIGH_QUALITY_MIN_REVIEWS = 50

    ITINERARY_DAYS = 3
    PLACES_PER_DAY = 3
    TOTAL_PLACES = ITINERARY_DAYS * PLACES_PER_DAY

    EARTH_RADIUS_KM = 6371.0

    CATEGORY_SIMILARITY_MATRIX = {
        "Khám phá": ["Phiêu lưu", "Văn hóa"],
        "Phiêu lưu": ["Khám phá", "Thư giãn"],
        "Văn hóa": ["Khám phá", "Ẩm thực"],
        "Thư giãn": ["Ẩm thực", "Phiêu lưu"],
        "Ẩm thực": ["Thư giãn", "Văn hóa"],
    }

    def __init__(self):
        env_path = Path(__file__).resolve().parent.parent / '.env'
        load_dotenv(dotenv_path=env_path)

        self.SUPABASE_URL = os.getenv("SUPABASE_URL")
        self.SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

        if self.SUPABASE_URL and self.SUPABASE_KEY:
            self.supabase_client = create_client(self.SUPABASE_URL, self.SUPABASE_KEY)
        else:
            self.supabase_client = None
settings = Settings()
