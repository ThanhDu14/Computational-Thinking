import requests
import time

BASE_URL = "http://127.0.0.1:8000"
USER_ID = "vietnam_traveler_01"
session_id = None

def run_tests():
    global session_id

    print("🚀 BẮT ĐẦU KIỂM THỬ API CHATBOT...")

    # 1. Test Tạo đoạn chat mới
    print("\n1️⃣ Test: Tạo đoạn chat mới...")
    resp = requests.post(f"{BASE_URL}/chat/new", json={"user_id": USER_ID})
    if resp.status_code == 200:
        session_id = resp.json()["session_id"]
        print(f"✅ Thành công! Session ID: {session_id}")
    else:
        print("❌ Lỗi tạo session")
        return

    # 2. Test Chat (Hỏi AI)
    print("\n2️⃣ Test: Gửi câu hỏi đầu tiên...")
    chat_payload = {
        "message": "Nha Trang có món gì ngon?",
        "user_id": USER_ID,
        "session_id": session_id
    }
    resp = requests.post(f"{BASE_URL}/chat", json=chat_payload)
    if resp.status_code == 200:
        print(f"🤖 Bot trả lời: {resp.json()['reply'][:100]}...")
    else:
        print(f"❌ Lỗi chat: {resp.text}")

    # 3. Test Lấy lịch sử chat để hiển thị
    print("\n3️⃣ Test: Lấy lịch sử tin nhắn...")
    resp = requests.get(f"{BASE_URL}/chat/{session_id}/history")
    if resp.status_code == 200:
        msgs = resp.json()["messages"]
        print(f"✅ Đã lấy {len(msgs)} tin nhắn.")
        for m in msgs:
            print(f"   - {m['role'].upper()}: {m['content'][:50]}...")
    
    # 4. Test Lấy danh sách phiên (Sidebar)
    print("\n4️⃣ Test: Lấy tất cả phiên chat của User...")
    resp = requests.get(f"{BASE_URL}/sessions/{USER_ID}")
    if resp.status_code == 200:
        sessions = resp.json()["sessions"]
        print(f"✅ Tìm thấy {len(sessions)} phiên chat.")

    # 5. Test Xóa cuộc hội thoại
    print(f"\n5️⃣ Test: Xóa cuộc hội thoại {session_id}...")
    resp = requests.delete(f"{BASE_URL}/chat/{session_id}")
    if resp.status_code == 200:
        print(f"✅ {resp.json()['message']}")
    else:
        print(f"❌ Lỗi khi xóa")

if __name__ == "__main__":
    # Đảm bảo bạn đã chạy: uvicorn main:app --reload trước khi chạy file này
    try:
        run_tests()
    except Exception as e:
        print(f"❌ Không thể kết nối tới Server: {e}")