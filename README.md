# PETT Shop - Hệ thống quản lý cửa hàng thú cưng

Dự án bao gồm Backend (FastAPI) và Frontend (React + Vite).

## 🚀 Hướng dẫn cài đặt nhanh

### 1. Cấu hình môi trường (Environment Variables)

*   **Backend**: 
    *   Vào thư mục `Backend/`, copy file `.env.example` thành `.env`.
    *   Cập nhật các giá trị trong `.env` (đặc biệt là `GOOGLE_CLIENT_ID` và `JWT_SECRET`).
*   **Frontend**:
    *   Vào thư mục `frontend/`, copy file `.env.example` thành `.env`.
    *   Cập nhật `VITE_GOOGLE_CLIENT_ID` giống với backend.

### 2. Cài đặt Backend

```bash
cd Backend
# Tạo môi trường ảo (khuyến nghị)
python -m venv venv
source venv/bin/activate  # Trên Windows dùng: venv\Scripts\activate

# Cài đặt thư viện
pip install -r requirements.txt

# Khởi tạo dữ liệu mẫu cho Database
python init_db.py

# Chạy server
uvicorn main:app --reload
```

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🛠 Lưu ý quan trọng cho người mới Clone

1.  **Khởi tạo Database**: Sau khi clone dự án, file database `.db` không được đi kèm. Bạn **bắt buộc** phải chạy lệnh `python init_db.py` trong thư mục `Backend` để tạo dữ liệu sản phẩm và bài viết mẫu.
2.  **Thư mục làm việc**: Khi chạy Backend, hãy đảm bảo bạn đang đứng trong thư mục `Backend/` để tránh lỗi import.
3.  **Google Login**: Để tính năng đăng nhập Google hoạt động, bạn cần tạo Client ID trên [Google Cloud Console](https://console.cloud.google.com/) và thêm `http://localhost:5173` vào danh sách *Authorized JavaScript origins*.

## 📂 Cấu trúc dự án

*   `/Backend`: API FastAPI, SQLAlchemy models, SQLite database.
*   `/frontend`: React application, Tailwind CSS.
*   `extracted_products.json`: Dữ liệu mẫu sản phẩm.
*   `extracted_blogs.json`: Dữ liệu mẫu bài viết.

---
Phát triển bởi PETT Team.
