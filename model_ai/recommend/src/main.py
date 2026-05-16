import json
from src.recommender import recommend

if __name__ == "__main__":
    # Ví dụ sử dụng
    sample_input = {
        "destination": {
            "province": "Khánh Hòa"
        },
        "preferences": {
            "categories": ["Khám phá", "Ẩm thực"],
            "place_style": "must_go"
        },
        "logistics": {
            "starting_point": {
                "type": "address",
                "name": "Trung tâm"
            },
            "transportation": "motorbike"
        }
    }

    result = recommend(sample_input)
    print("\n" + "=" * 70)
    print(json.dumps(result, ensure_ascii=False, indent=2))
