# API Lấy Thông Tin Thời Tiết (Weather API)

Tài liệu hướng dẫn gọi API lấy thông tin thời tiết dành cho FrontEnd.

## 1. Thông tin Endpoint
- **URL**: `http://13.229.155.181:8080/api/weather`
- **Method**: `GET`
- **Headers**:
  - `Content-Type: application/json`
- **Query Parameters**:
  - `city` (string, bắt buộc): Tên thành phố cần lấy thời tiết (ví dụ: `Hanoi`, `Saigon`, `Danang`, `Paris`, ...).

## 2. Ví dụ cách gọi trong FrontEnd (JavaScript / Fetch)
```javascript
const fetchWeather = async (city) => {
  try {
    const response = await fetch(`http://13.229.155.181:8080/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Thông tin thời tiết:', data.data);
      // Xử lý dữ liệu thời tiết ở đây (ví dụ: lưu vào state)
      const temp = data.data.main.temp; // Nhiệt độ
      const description = data.data.weather[0].description; // Mô tả thời tiết bằng tiếng Việt
      const iconCode = data.data.weather[0].icon; // Mã icon
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Link ảnh icon hiển thị
    } else {
      console.error('Lỗi từ Server:', data.message);
    }
  } catch (error) {
    console.error('Lỗi kết nối API:', error);
  }
};

// Gọi thử nghiệm
fetchWeather('Hanoi');
```

## 3. Cấu trúc dữ liệu phản hồi (Response Structure)

### Phản hồi thành công (200 OK)
```json
{
  "status": "success",
  "code": 200,
  "message": "Lấy thông tin thời tiết thành công",
  "data": {
    "coord": { "lon": 105.8412, "lat": 21.0245 },
    "weather": [
      {
        "id": 803,
        "main": "Clouds",
        "description": "mây rải rác",
        "icon": "04d"
      }
    ],
    "base": "stations",
    "main": {
      "temp": 30.5,
      "feels_like": 35.2,
      "temp_min": 30.5,
      "temp_max": 30.5,
      "pressure": 1008,
      "humidity": 66
    },
    "visibility": 10000,
    "wind": { "speed": 4.12, "deg": 130 },
    "clouds": { "all": 75 },
    "dt": 1716127200,
    "sys": {
      "type": 1,
      "id": 9308,
      "country": "VN",
      "sunrise": 1716090123,
      "sunset": 1716137654
    },
    "timezone": 25200,
    "id": 1581130,
    "name": "Hanoi",
    "cod": 200
  }
}
```

#### Một số trường dữ liệu quan trọng trong `data`:
- `data.name`: Tên thành phố trả về (`Hanoi`).
- `data.main.temp`: Nhiệt độ hiện tại (**Độ C**).
- `data.main.feels_like`: Nhiệt độ cảm nhận thực tế (**Độ C**).
- `data.main.humidity`: Độ ẩm thực tế (**%**).
- `data.weather[0].description`: Mô tả thời tiết bằng **tiếng Việt** (ví dụ: *mây rải rác*, *mưa rào*, *nắng nhẹ*,...).
- `data.weather[0].icon`: Mã icon của thời tiết. Bạn có thể sử dụng link sau để hiển thị hình ảnh thời tiết trực quan:
  `https://openweathermap.org/img/wn/{icon}@2x.png` (Ví dụ: `https://openweathermap.org/img/wn/04d@2x.png`).

---

### Phản hồi thất bại (ví dụ: Không tìm thấy thành phố - 404 Not Found)
```json
{
  "status": "error",
  "code": 404,
  "message": "Lỗi từ OpenWeather: city not found",
  "data": null
}
```

### Phản hồi thất bại (ví dụ: Thiếu tham số `city` - 400 Bad Request)
```json
{
  "status": "error",
  "code": 400,
  "message": "Thiếu tham số city (ví dụ: ?city=Hanoi)",
  "data": null
}
```
