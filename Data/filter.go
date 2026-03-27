package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

// ĐIỀN API KEY CỦA BẠN VÀO ĐÂY
const GEMINI_API_KEY = "Your_API_KEY"

type Review struct {
	ReviewerName string `json:"reviewer_name"`
	Stars        string `json:"stars"`
	Comment      string `json:"comment"`
}

type Location struct {
	URL           string   `json:"url"`
	LocationName  string   `json:"location_name"`
	Address       string   `json:"address"`
	OverallRating string   `json:"overall_rating"`
	OpeningHours  string   `json:"opening_hours"`
	Description   string   `json:"description"`
	Images        []string `json:"images"`
	Reviews       []Review `json:"reviews"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func cleanLocationName(name string) string {
	garbage1 := "UnclaimedIf you own this business, claim it for free now to update business info, respond to reviews, and more.Claim this listing"
	garbage2 := "Someone from this business manages the listing."

	name = strings.ReplaceAll(name, garbage1, "")
	name = strings.ReplaceAll(name, garbage2, "")
	return strings.TrimSpace(name)
}

func main() {
	// 1. Đọc dữ liệu gốc
	data, err := ioutil.ReadFile("data.json")
	if err != nil {
		fmt.Println("Lỗi đọc file:", err)
		return
	}

	var originalLocations []Location
	json.Unmarshal(data, &originalLocations)

	var names []string
	var preFilteredLocations []Location // Lưu danh sách đã qua vòng sơ loại

	// 2. BƯỚC LỌC SƠ BỘ (Rating, Review rỗng, và lọc luôn Ảnh rác)
	for _, loc := range originalLocations {
		// Loại trừ địa điểm thiếu Rating hoặc không có bài Review
		if loc.OverallRating == "N/A" || len(loc.Reviews) == 0 {
			continue 
		}

		cleanedName := cleanLocationName(loc.LocationName)
		if cleanedName == "" {
			continue
		}

		// --- TÍNH NĂNG MỚI: LỌC HÌNH ẢNH ---
		var validImages []string
		for _, imgURL := range loc.Images {
			// Chỉ giữ lại những link ảnh có chứa thông số 700x400
			if strings.Contains(imgURL, "w=700&h=400") {
				validImages = append(validImages, imgURL)
			}
		}
		
		// Cập nhật lại tên đã làm sạch và mảng hình ảnh chỉ toàn ảnh xịn
		loc.LocationName = cleanedName
		loc.Images = validImages 

		// Đưa vào danh sách chờ gửi AI
		names = append(names, cleanedName)
		preFilteredLocations = append(preFilteredLocations, loc)
	}

	namesListStr := strings.Join(names, "\n- ")
	fmt.Printf("Đã dọn dẹp xong. Giữ lại %d địa điểm. Đang gửi AI...\n", len(names))

	// 3. Xây dựng Prompt cho AI
	prompt := fmt.Sprintf(`Dưới đây là danh sách tên các địa điểm được cào từ web. 
Hãy lọc ra CHỈ những địa điểm là điểm tham quan du lịch, danh lam thắng cảnh, di tích lịch sử, bảo tàng, đền chùa, nhà thờ, quảng trường, phố đi bộ. 
LOẠI BỎ các trường học, phòng khám, bệnh viện, nha khoa, spa, tiệm massage, trung tâm tiếng Anh, nhà xe, công ty, câu lạc bộ game/e-gaming.

Trả về mảng JSON chứa các chuỗi (string) tên hợp lệ. Không giải thích thêm.
Danh sách:
- %s`, namesListStr)

	// 4. Gọi API Gemini 2.5 Flash
	reqBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"response_mime_type": "application/json",
		},
	}
	
	jsonReqBody, _ := json.Marshal(reqBody)
	apiURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY

	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonReqBody))
	if err != nil {
		fmt.Println("Lỗi mạng:", err)
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	var geminiResp GeminiResponse
	json.Unmarshal(body, &geminiResp)

	if len(geminiResp.Candidates) == 0 {
		fmt.Println("Lỗi từ AI. Phản hồi gốc:", string(body))
		return
	}

	// 5. Lấy kết quả từ AI
	var approvedNames []string
	json.Unmarshal([]byte(geminiResp.Candidates[0].Content.Parts[0].Text), &approvedNames)

	// Chuyển thành map để tra cứu tốc độ cao
	validMap := make(map[string]bool)
	for _, name := range approvedNames {
		validMap[strings.TrimSpace(name)] = true
	}

	// 6. Ráp lại dữ liệu dựa trên danh sách sơ loại ban đầu
	var finalLocations []Location
	for _, loc := range preFilteredLocations {
		if validMap[loc.LocationName] {
			finalLocations = append(finalLocations, loc)
		}
	}

	// 7. Ghi ra file kết quả
	outputData, _ := json.MarshalIndent(finalLocations, "", "    ")
	ioutil.WriteFile("final_attractions.json", outputData, 0644)
	fmt.Printf("Hoàn tất! Đã lưu %d địa điểm tham quan chuẩn xịn vào 'final_attractions.json'\n", len(finalLocations))
}