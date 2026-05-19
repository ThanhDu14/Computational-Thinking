from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from recommend.src.recommender import recommend

recommend_router = APIRouter(tags=["Recommend"])

class RecommendDestination(BaseModel):
    province: str

class RecommendPreferences(BaseModel):
    categories: List[str]
    place_style: str = "must_go"

class RecommendStartingPoint(BaseModel):
    type: str = "address"
    name: str = "Trung tâm"

class RecommendLogistics(BaseModel):
    starting_point: RecommendStartingPoint
    transportation: str = "motorbike"

class RecommendRequest(BaseModel):
    destination: RecommendDestination
    preferences: RecommendPreferences
    logistics: RecommendLogistics

class RecommendSaveRequest(BaseModel):
    itinerary: dict

@recommend_router.post("/recommend")
async def get_recommendation(request: RecommendRequest):
    """Gợi ý lịch trình du lịch (chỉ dự đoán, không lưu DB)."""
    try:
        input_data = request.model_dump()
        result = recommend(input_data)
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@recommend_router.post("/recommend/save/{user_id}")
async def save_recommendation(user_id: UUID, request: RecommendSaveRequest):
    """Lưu kết quả gợi ý lịch trình lên Supabase (chỉ lưu itinerary)."""
    try:
        from recommend.utils.database import db_manager

        saved_data = db_manager.save_recommendation_result(
            user_id=str(user_id),
            itinerary=request.itinerary,
        )

        if not saved_data:
            raise HTTPException(status_code=500, detail="Không thể lưu kết quả lên Supabase.")

        return {
            "status": "success",
            "message": "Đã lưu lịch trình thành công.",
            "saved": saved_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@recommend_router.get("/recommend/history/{user_id}")
async def get_recommendation_history(user_id: UUID):
    """Lấy lịch sử lịch trình đã lưu của user."""
    try:
        from recommend.utils.database import db_manager
        
        history = db_manager.get_user_itinerary_history(str(user_id))
        
        return {
            "status": "success",
            "user_id": str(user_id),
            "total": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@recommend_router.get("/recommend/plan/{plan_id}")
async def get_plan_detail(plan_id: UUID):
    """Lấy chi tiết một lịch trình cụ thể."""
    try:
        from recommend.utils.database import db_manager
        
        plan = db_manager.get_plan_detail(str(plan_id))
        if not plan:
            raise HTTPException(status_code=404, detail="Không tìm thấy lịch trình.")
            
        return {
            "status": "success",
            "plan": plan
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@recommend_router.delete("/recommend/plan/{plan_id}")
async def delete_plan(plan_id: UUID):
    """Xóa một lịch trình cụ thể."""
    try:
        from recommend.utils.database import db_manager
        
        success = db_manager.delete_plan(str(plan_id))
        if not success:
            raise HTTPException(status_code=404, detail="Không tìm thấy lịch trình hoặc xóa thất bại.")
            
        return {
            "status": "success",
            "message": "Đã xóa lịch trình thành công."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(title="Recommend API (Standalone)")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(recommend_router)
    
    print("🚀 Chạy Recommend API độc lập trên cổng 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
