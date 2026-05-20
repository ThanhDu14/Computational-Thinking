# ============================================================
# test_chat_api.py
# Test tuần tự API Chatbot
# Chỉ chạy testcase tiếp theo khi nhấn ENTER
# ============================================================

import os
import requests
import json
from uuid import uuid4
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://127.0.0.1:8000"
AI_KEY = os.getenv("AI_KEY")
HEADERS = {"X-Internal-Secret": AI_KEY}

# ============================================================
# USER TEST
# ============================================================

USER_ID = "c16ed0ed-216d-4160-96ba-71b1c531593d"

session_id = None


# ============================================================
# HELPER
# ============================================================

def wait_next():
    input("\n>>> Nhấn ENTER để chạy testcase tiếp theo...")


def print_response(res):
    print(f"STATUS: {res.status_code}")

    try:
        print(json.dumps(res.json(), indent=4, ensure_ascii=False))
    except:
        print(res.text)


# ============================================================
# TEST 1 — TẠO CHAT MỚI
# ============================================================

def test_create_chat():
    global session_id

    print("\n================ TEST 1: CREATE CHAT ================\n")

    payload = {
        "user_id": USER_ID
    }

    res = requests.post(
        f"{BASE_URL}/chat/new",
        json=payload,
        headers=HEADERS
    )

    print_response(res)

    if res.status_code == 200:
        session_id = res.json()["session_id"]


# ============================================================
# TEST 2 — CHAT
# ============================================================

def test_chat():
    print("\n================ TEST 2: CHAT ================\n")

    payload = {
        "message": "Xin chào",
        "user_id": USER_ID,
        "session_id": session_id
    }

    res = requests.post(
        f"{BASE_URL}/chat",
        json=payload,
        headers=HEADERS
    )

    print_response(res)


# ============================================================
# TEST 3 — LẤY HISTORY
# ============================================================

def test_history():
    print("\n================ TEST 3: HISTORY ================\n")

    res = requests.get(
        f"{BASE_URL}/chat/{USER_ID}/{session_id}/history",
        headers=HEADERS
    )

    print_response(res)


# ============================================================
# TEST 4 — LẤY DANH SÁCH SESSION
# ============================================================

def test_get_sessions():
    print("\n================ TEST 4: GET SESSIONS ================\n")

    res = requests.get(
        f"{BASE_URL}/sessions/{USER_ID}",
        headers=HEADERS
    )

    print_response(res)


# ============================================================
# TEST 5 — ĐỔI TÊN SESSION
# ============================================================

def test_rename_session():
    print("\n================ TEST 5: RENAME SESSION ================\n")

    payload = {
        "title": "Du lịch Cao Bằng"
    }

    res = requests.patch(
        f"{BASE_URL}/sessions/{USER_ID}/{session_id}/title",
        json=payload,
        headers=HEADERS
    )

    print_response(res)


# ============================================================
# TEST 6 — XÓA SESSION
# ============================================================

def test_delete_session():
    print("\n================ TEST 6: DELETE SESSION ================\n")

    res = requests.delete(
        f"{BASE_URL}/chat/{USER_ID}/{session_id}",
        headers=HEADERS
    )

    print_response(res)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("\n===================================================")
    print("USER_ID:", USER_ID)
    print("===================================================\n")

    test_create_chat()
    wait_next()

    test_chat()
    wait_next()

    test_history()
    wait_next()

    test_get_sessions()
    wait_next()

    test_rename_session()
    wait_next()

    test_delete_session()

    print("\n================ DONE ================\n")