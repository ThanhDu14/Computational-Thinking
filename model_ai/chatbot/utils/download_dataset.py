from huggingface_hub import hf_hub_download
import os

def download_from_hf(
    repo_id: str,
    file_name: str,
    local_dir: str = "model_ai/chatbot/embeddings/vector_db",
    repo_type: str = "dataset"
):
    print("=" * 50)
    print(f"Đang tải file: {file_name}")
    print("=" * 50)

    try:
        os.makedirs(local_dir, exist_ok=True)

        file_path = hf_hub_download(
            repo_id=repo_id,
            repo_type=repo_type,
            filename=file_name,
            local_dir=local_dir
        )

        print("✅ Tải thành công!")
        print(f"📂 Đường dẫn: {file_path}")

        return file_path

    except Exception as e:
        print(f"❌ Lỗi tải: {e}")
        return None