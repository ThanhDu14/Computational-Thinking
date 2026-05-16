from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn

from src.recommender import recommend

app = FastAPI(
    title="Travel Recommendation API",
    description="API hệ thống đề xuất địa điểm du lịch và lên lịch trình 3 ngày.",
    version="1.0.0"
)

class Destination(BaseModel):
    province: str

class Preferences(BaseModel):
    categories: List[str]
    place_style: str = "must_go"

class StartingPoint(BaseModel):
    type: str = "address"
    name: str = "Trung tâm"

class Logistics(BaseModel):
    starting_point: StartingPoint
    transportation: str = "motorbike"

class RecommendRequest(BaseModel):
    destination: Destination
    preferences: Preferences
    logistics: Logistics

@app.post("/recommend")
async def get_recommendation(request: RecommendRequest):
    try:
        input_data = request.model_dump()
        result = recommend(input_data)
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("api.recommend_api:app", host="0.0.0.0", port=8000, reload=True)
