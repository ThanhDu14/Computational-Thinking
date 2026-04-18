import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import random
import json
import os
import re
import requests
import sys
import urllib.parse
from google import genai
from google.genai import types

# Tắt lỗi báo rác [WinError 6] của undetected_chromedriver
if hasattr(uc.Chrome, '__del__'):
    uc.Chrome.__del__ = lambda self: None


# CẤU HÌNH HỆ THỐNG

# 1. Cấu hình API Keys
GEMINI_API_KEY = "AIzaSyBBhfUTejf7aM2ON8oF0Nla1mKk1QuKap8" 

# 2. Cấu hình cào dữ liệu (Scraping)
LIST_PAGE_URL = "https://www.tripadvisor.com.vn/Attractions-g293928-Activities-c47-Nha_Trang_Khanh_Hoa_Province.html"
LOCATION = "Nha Trang" 
VERSION_MAIN = 147  
MAX_PAGES = 999 

# 3. Cấu hình File trung gian và đầu ra
LINKS_FILE = f"link_{LOCATION.lower().replace(' ', '_')}.json"
RAW_DATA_FILE = f"data_raw_{LOCATION.lower().replace(' ', '_')}.json"
MISSING_LINK_FILE = f"new_link_{LOCATION.lower().replace(' ', '_')}.json"
FINAL_OUTPUT_FILE = f"data_{LOCATION.lower().replace(' ', '_')}_final.json"


# GIAI ĐOẠN 1: CÀO DỮ LIỆU (CRAWL)

def load_json(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_json(data, filepath):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def init_driver():
    options = uc.ChromeOptions()
    options.page_load_strategy = 'eager'
    return uc.Chrome(options=options, version_main=VERSION_MAIN, use_subprocess=True)

def get_wikimedia_images(location_name, max_images=10):
    if not location_name or location_name == "N/A" or max_images <= 0: return []
    url = "https://commons.wikimedia.org/w/api.php"
    headers = {"User-Agent": "BotTripDataScraper/1.0"}

    def fetch_images(search_query):
        params = {
            "action": "query", "format": "json", "generator": "search",
            "gsrnamespace": 6, "gsrsearch": search_query, "gsrlimit": max_images,    
            "prop": "imageinfo", "iiprop": "url|mime"        
        }
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "query" in data and "pages" in data["query"]:
                    pages = data["query"]["pages"]
                    img_links = []
                    for page_id, page_info in pages.items():
                        if "imageinfo" in page_info:
                            img_info = page_info["imageinfo"][0]
                            if img_info.get("mime") in ["image/jpeg", "image/png"]:
                                img_links.append(img_info["url"])
                    return img_links
        except Exception:
            pass
        return []

    query_full = f"{location_name} {LOCATION}"
    images = fetch_images(query_full)
    if not images:
        images = fetch_images(location_name)
    return images[:max_images]

def get_top_attraction_links(driver, start_url):
    all_links, visited_links = [], set()
    current_url, page_count = start_url, 1

    while current_url and page_count <= MAX_PAGES:
        print(f"\n[QUÉT LINK] Đang quét trang {page_count}: {current_url}")
        
        page_success = False
        fail_count = 0 
        soup = None
        
        while not page_success:
            try:
                driver.get(current_url)
                WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-automation="cardWrapper"], a[data-automation="cardTitle"]')))
                
                for _ in range(4):
                    driver.execute_script("window.scrollBy(0, 1000);")
                    time.sleep(1)
                
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                trash_selectors = ['div[data-automation*="Shelf"]', 'div[data-automation*="Carousel"]', 'div[data-automation*="RecentlyViewed"]', 'div[data-automation="WebPresentation_AsFeaturedInWidgetPlaceholder"]', '.MIrqC']
                for selector in trash_selectors:
                    for trash in soup.select(selector):
                        trash.decompose() 
                
                top_links_tags = []
                cards = soup.select('div[data-automation="cardWrapper"]')
                if cards:
                    for card in cards:
                        a_tag = card.select_one('a[href^="/Attraction_Review-"]')
                        if a_tag: top_links_tags.append(a_tag)
                else:
                    top_links_tags = soup.select('a[data-automation="cardTitle"], a[data-automation="cardHeaderTitleLink"]')
                    
                new_links_count = 0
                for a in top_links_tags:
                    href = a.get('href')
                    if not href: continue
                    clean_href = href.split('?')[0]
                    if clean_href.startswith('/Attraction_Review-') and "-or" not in clean_href and "#" not in clean_href:
                        full_url = clean_href if clean_href.startswith('http') else "https://www.tripadvisor.com" + clean_href
                        if full_url not in visited_links:
                            visited_links.add(full_url)
                            all_links.append(full_url)
                            new_links_count += 1
                
                if new_links_count > 0:
                    print(f"-> Đã gom được {new_links_count} ĐỊA ĐIỂM mới. Tổng: {len(all_links)}")
                    page_success = True
                else:
                    raise Exception("Load thành công nhưng không tìm thấy link (Bị block ngầm).")

            except Exception as e:
                fail_count += 1
                print(f"⚠️ Không tải được link trang {page_count} (Thử lại lần {fail_count}): {e}")
                
                if fail_count <= 2:
                    print("🔄 Đang tiến hành reset trang (Tải lại)...")
                    time.sleep(3)
                else:
                    print("🛑 Đã reset 2 lần không được! KHỞI ĐỘNG LẠI TRÌNH DUYỆT CHROME MỚI...")
                    try: driver.quit()
                    except: pass
                    time.sleep(3)
                    driver = init_driver()
                    fail_count = 0 
                    time.sleep(3)

        next_button = soup.select_one('div[data-automation="pagination"] a[aria-label*="Next"], div[data-smoke-attr="pagination"] a[data-smoke-attr*="next"], a[data-smoke-attr="pagination-next-arrow"]')
        if next_button and next_button.get('href'):
            next_href = next_button.get('href')
            current_url = next_href if next_href.startswith('http') else "https://www.tripadvisor.com" + next_href
            page_count += 1
            time.sleep(random.uniform(3, 5)) 
        else:
            print(f"✅ Không còn nút Next. Đã quét xong {page_count} trang.")
            break
            
    return all_links, driver

def scrape_detail_page(driver, url):
    driver.get(url)
    try: WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'h1[data-test-target="mainH1"]')))
    except: return None
    
    driver.execute_script("window.scrollTo(0, 1500);")
    time.sleep(0.5)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    name = "N/A"
    name_tag = soup.select_one('h1[data-test-target="mainH1"]')
    if name_tag:
        texts = [element for element in name_tag.contents if isinstance(element, str)]
        if not texts:
             span_tag = name_tag.find('span')
             if span_tag: name = span_tag.get_text(strip=True)
        else:
             name = "".join(texts).strip()
        if name and name != "N/A":
             name = re.sub(r'Someone from this business manages the listing.*', '', name).strip()
    
    rating = "N/A"
    rating_tag = soup.select_one('div[data-automation="bubbleRatingValue"]')
    if rating_tag: rating = f"{rating_tag.get_text(strip=True)}/5"
    else:
        rating_svg = soup.select_one('svg[data-automation="bubbleRatingImage"] title')
        if rating_svg: rating = rating_svg.get_text(strip=True).split(' ')[0] + "/5"

    hours = "N/A"
    hours_tag = soup.select_one('div[data-automation$=".openHours"]')
    if hours_tag: hours = hours_tag.get_text(strip=True)

    desc = "N/A"
    desc_tag = soup.select_one('div[data-automation="attractionsAboutContent"]')
    if desc_tag:
        desc = desc_tag.get_text(separator=' ', strip=True)
    else:
        for label in soup.find_all(string=re.compile(r"^About$|^Về$|^Giới thiệu$", re.IGNORECASE)):
            sib = label.parent.find_next_sibling()
            if sib and len(sib.get_text(strip=True)) > 30:
                desc = sib.get_text(separator=' ', strip=True)
                break
        if desc == "N/A":
            desc_tag_2 = soup.select_one('.pZqGj, div[data-automation="WebPresentation_PoiAboutSection"]')
            if desc_tag_2: desc = desc_tag_2.get_text(separator=' ', strip=True)

    if desc != "N/A":
        invalid_keywords = ["review snippets are selected", " bubbles ", "read more"]
        if any(kw in desc.lower() for kw in invalid_keywords):
            desc = "N/A"

    images = []
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src')
        if src and ('media/photo' in src or 'dynamic-media' in src):
            if src not in images:
                images.append(src)
        if len(images) >= 3:
            break
            
    tripadvisor_image_count = len(images)

    remaining_slots = 10 - len(images)
    if remaining_slots > 0:
        wiki_images = get_wikimedia_images(name, max_images=remaining_slots)
        images.extend(wiki_images)

    reviews = []
    for block in soup.select('div[data-automation="reviewCard"]'):
        user_tag = block.select_one('a[href^="/Profile/"]')
        user_name = user_tag.get_text(strip=True) if user_tag else "N/A"
        r_star = "N/A"
        r_star_tag = block.select_one('svg[data-automation="bubbleRatingImage"] title')
        if r_star_tag: r_star = f"{r_star_tag.get_text(strip=True).split(' ')[0]}/5"
        content_tag = block.select_one('.JguWG, span.yCeTE')
        content = content_tag.get_text(separator=' ', strip=True) if content_tag else ""
        reviews.append({"reviewer_name": user_name, "stars": r_star, "comment": content})

    address = "N/A"
    for label in ["The area", "Address", "Địa chỉ", "Khu vực"]:
        label_elements = soup.find_all(string=re.compile(f"^{label}$", re.IGNORECASE))
        for el in label_elements:
            parent = el.parent
            sibling = parent.find_next_sibling()
            if sibling:
                text = sibling.get_text(separator="|", strip=True)
                
                trash_keywords = [
                    "Best nearby", "Restaurants", "Things to Do", "Reach out directly", 
                    "Website", "Email", "Improve this listing", "Tours & experiences", 
                    "Nhà hàng", "Điểm tham quan", "Gần đây"
                ]
                
                for trash in trash_keywords:
                    if trash in text:
                        text = text.split(trash)[0]
                
                text = text.replace('|', ', ').strip(', |.-')
                
                if len(text) > 5:
                    address = text
                    break
        if address != "N/A":
            break

    if address != "N/A":
        address = re.sub(r'^(Address|Địa chỉ|The area|Khu vực)[\s,:]*', '', address, flags=re.IGNORECASE)
        address = address.strip(' ,.-|\n\t')
        
    if len(address) < 5:
        address = "N/A"

    rating_count = "N/A"
    rc_tag = soup.select_one('div[data-automation="bubbleReviewCount"]')
    if rc_tag:
        match = re.search(r'([\d,]+)', rc_tag.get_text(strip=True))
        if match: rating_count = match.group(1)

    if tripadvisor_image_count == 0 or rating == "N/A":
        return {"reject": True, "reason": "Thiếu ảnh TripAdvisor gốc hoặc chưa có đánh sao."}

    return {
        "url": url,
        "location_name": name,
        "city": LOCATION,          # ← FIELD MỚI: Thành phố, lấy từ biến LOCATION
        "address": address,
        "overall_rating": rating,
        "rating_count": rating_count,
        "opening_hours": hours,
        "description": desc,
        "images": images,
        "reviews": reviews
    }

def phase_1_crawl():
    print("\n" + "="*50)
    print("🚀 GIAI ĐOẠN 1: BẮT ĐẦU CÀO DỮ LIỆU TỪ TRIPADVISOR")
    print("="*50)
    
    driver = None
    try:
        driver = init_driver()
        existing_data = load_json(RAW_DATA_FILE)
        
        visited_urls = set(item['url'] for item in existing_data if 'url' in item)
        visited_names = set(item['location_name'] for item in existing_data if 'location_name' in item)
        
        print(f"Đã có {len(visited_urls)} địa điểm trong database tạm.")

        all_links = load_json(LINKS_FILE)
        if all_links:
            all_links = [l.replace("tripadvisor.com.vn", "tripadvisor.com") for l in all_links]
            
        if not all_links:
            all_links, driver = get_top_attraction_links(driver, LIST_PAGE_URL)
            if all_links: save_json(all_links, LINKS_FILE)
            else: return existing_data
        else:
            print(f"[THÔNG BÁO] Đã tải {len(all_links)} link từ {LINKS_FILE}.")

        links_to_scrape = [l for l in all_links if l not in visited_urls]
        if not links_to_scrape:
            print("\n✅ Cào dữ liệu hoàn tất (Không có link mới).")
            return existing_data
            
        print(f"\n[TIẾN HÀNH CÀO CHI TIẾT] {len(links_to_scrape)} địa điểm mới.")
        for i, link in enumerate(links_to_scrape, 1):
            success = False
            browser_resets = 0
            
            while not success:
                for attempt in range(3):
                    try:
                        print(f"[{i}/{len(links_to_scrape)}] Xử lý: {link}")
                        data = scrape_detail_page(driver, link)
                        
                        if data:
                            if data.get("reject"):
                                print(f" -> Loại bỏ vĩnh viễn: {data.get('reason')}")
                                success = True
                                break
                                
                            if data.get('location_name', 'N/A') != "N/A":
                                if data['location_name'] not in visited_names:
                                    existing_data.append(data)
                                    visited_names.add(data['location_name'])
                                    save_json(existing_data, RAW_DATA_FILE) 
                                    
                                    print(f" -> Xong: {data['location_name']} (City: {data['city']})")
                                if data['address'] != 'N/A':
                                    print(f"    [+] Bắt được Address: {data['address'][:60]}...")
                                else:
                                    print(f"    [-] Web giấu Address, sẽ tìm bằng API ở Giai đoạn 4.")
                            else:
                                print(f" -> Bỏ qua: {data['location_name']} (Bị trùng lặp với dữ liệu đã có)")
                            
                            success = True
                            break 
                        else: print(" -> Load chậm/lỗi hoặc trang không tồn tại.")
                    except Exception as e: print(f" -> Lỗi: {e}")
                    
                    if not success and attempt < 2: time.sleep(random.uniform(2, 3))

                if not success:
                    browser_resets += 1
                    print(f"\n[CẢNH BÁO] Thất bại 3 lần! Đang reset trình duyệt để CÀO LẠI TRANG NÀY VÔ HẠN (Reset lần {browser_resets})...\n")
                    try: driver.quit()
                    except: pass
                    time.sleep(2)
                    driver = init_driver()

            time.sleep(random.uniform(1, 2.5)) 

        print("\n✅ GIAI ĐOẠN 1 HOÀN TẤT.")
        return existing_data
    except Exception as e:
        print(f"Lỗi Phase 1: {e}")
        return load_json(RAW_DATA_FILE)
    finally:
        if driver:
            try: driver.quit()
            except: pass


# GIAI ĐOẠN 2: LỌC DỮ LIỆU BẰNG AI (FILTER)

def classify_with_gemini(locations):
    print("⏳ Đang gửi danh sách lên Gemini 2.5 Flash để phân tích...")
    client = genai.Client(api_key=GEMINI_API_KEY.strip())
    
    prompt = f"""
    Bạn là chuyên gia du lịch Việt Nam. Phân loại danh sách sau: 1 (Tham quan) và 0 (Không tham quan).
    * ĐÁNH 1: Di tích, đền, chùa, nhà thờ, bảo tàng, chợ, phố đi bộ, công viên, nông trại (Farm), khu vườn (Garden).
    * ĐÁNH 0: Spa, Massage, phòng khám, thẩm mỹ viện, xăm hình, công ty du lịch (Travels), bến xe, trường học, văn phòng.
    BẮT BUỘC trả về JSON DUY NHẤT. Keys là tên, Values là 1 hoặc 0 (số nguyên). Không giải thích.
    Danh sách: {json.dumps(locations, ensure_ascii=False)}
    """
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e):
                print(f"⚠️ Google API nghẽn. Tự động chờ 60s (Lần {attempt+1}/3)...")
                time.sleep(60)
            else:
                print(f"❌ Lỗi AI: {e}")
                return None
    return None

def phase_2_filter(raw_data):
    print("\n" + "="*50)
    print("🧠 GIAI ĐOẠN 2: LỌC CÁC ĐỊA ĐIỂM THAM QUAN VỚI GEMINI")
    print("="*50)
    
    if not raw_data: return []
    split_keywords = ["UnclaimedIf", "Someone from"]
    cleaned_locations = []
    
    for item in raw_data:
        name = item.get('location_name')
        if not name: continue
        cleaned_name = str(name)
        for kw in split_keywords:
            if kw in cleaned_name: cleaned_name = cleaned_name.split(kw)[0]
        cleaned_locations.append(cleaned_name.strip())
        
    unique_locations = list(set(cleaned_locations))
    ai_labels = classify_with_gemini(unique_locations)
    
    if not ai_labels:
        print("❌ Lỗi phân loại, trả về toàn bộ danh sách gốc.")
        return raw_data

    filtered_data = []
    for item in raw_data:
        raw_name = item.get('location_name')
        if not raw_name: continue
        cleaned_name = str(raw_name)
        for kw in split_keywords:
            if kw in cleaned_name: cleaned_name = cleaned_name.split(kw)[0]
        
        if ai_labels.get(cleaned_name.strip()) == 1:
            filtered_data.append(item)
            
    print(f"✅ Đã lọc thành công! Giữ lại {len(filtered_data)}/{len(raw_data)} địa điểm.")
    return filtered_data


# GIAI ĐOẠN 3: ĐIỀN DESCRIPTION TỪ WIKIPEDIA

def get_wiki_summary(location_name):
    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = "https://en.wikipedia.org/w/api.php"
    search_params = {"action": "query", "list": "search", "srsearch": f"{location_name} {LOCATION}", "format": "json", "utf8": 1}
    
    try:
        search_res = requests.get(search_url, params=search_params, headers=headers).json()
        search_results = search_res.get("query", {}).get("search", [])
        if not search_results: return "N/A"
            
        best_title = search_results[0]["title"]
        
        title_lower = best_title.lower()
        core_name = location_name.lower().replace(LOCATION.lower(), "").strip()
        core_words = [w for w in core_name.split() if w]
        
        if core_words:
            match_count = sum(1 for word in core_words if word in title_lower)
            if match_count == 0 or (match_count / len(core_words) < 0.3):
                return "N/A"
                
        summary_params = {"action": "query", "prop": "extracts", "exintro": 1, "explaintext": 1, "titles": best_title, "format": "json"}
        summary_res = requests.get(search_url, params=summary_params, headers=headers).json()
        pages = summary_res.get("query", {}).get("pages", {})
        
        for p_id, p_info in pages.items():
            if "extract" in p_info and p_info["extract"].strip():
                txt = p_info["extract"].strip()
                if len(txt) > 50:
                    return txt
    except: pass
    return "N/A"

def get_description_from_google_search(driver, location_name):
    try:
        query = f"description of {location_name} {LOCATION} in english"
        url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&hl=en"
        driver.get(url)
        time.sleep(3)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        for cls in ['.kno-rdesc', 'div[data-attrid="description"]', 'div.VwiC3b', '.BNeawe.s3v9rd.AP7Wnd']:
            element = soup.select_one(cls)
            if element:
                desc = element.get_text(separator=' ', strip=True)
                desc = re.sub(r'Wikipedia$', '', desc).strip()
                if len(desc) > 30 and "Wikipedia" not in desc[:10]:
                    return desc
    except Exception:
        pass
    return "N/A"

def get_gemini_description(location_name):
    try:
        client = genai.Client(api_key=GEMINI_API_KEY.strip())
        prompt = f"Write a short, engaging description (3-5 sentences) in English for the tourist attraction '{location_name}' in {LOCATION}, Vietnam. Return ONLY the description text, no intro or outro."
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        desc = response.text.strip(' "\'\n\t')
        if len(desc) > 20: 
            return desc
    except Exception as e:
        pass
    return "N/A"

def phase_3_fill_description(filtered_data):
    print("\n" + "="*50)
    print("📖 GIAI ĐOẠN 3: TÌM MÔ TẢ (WIKIPEDIA -> GOOGLE SEARCH -> GEMINI)")
    print("="*50)
    
    need_browser = any(
        item.get("description") == "N/A" or not item.get("description") or 
        any(kw in str(item.get("description", "")).lower() for kw in ["review snippets are selected", "bubbles", "read more"])
        for item in filtered_data
    )
    driver = None
    if need_browser:
        print("🚀 Đang khởi động Chrome để cào Google Search (Lớp 2)...")
        driver = init_driver()

    updated_count = 0
    for item in filtered_data:
        desc = item.get("description", "N/A")
        if desc != "N/A":
            invalid_keywords = ["review snippets are selected", "bubbles", "read more"]
            if any(kw in str(desc).lower() for kw in invalid_keywords):
                item["description"] = "N/A"
                desc = "N/A"
                
        if desc == "N/A" or not desc:
            name = item.get("location_name")
            print(f"  -> Tra cứu Wiki: {name}...")
            wiki_desc = get_wiki_summary(name)
            
            if wiki_desc != "N/A":
                item["description"] = wiki_desc
                updated_count += 1
                print(f"     [+] Cập nhật thành công từ Wiki!")
            else:
                if driver:
                    print(f"     [-] Không tìm thấy trên Wiki. Chuyển sang cào Google Search...")
                    google_desc = get_description_from_google_search(driver, name)
                    if google_desc != "N/A":
                        item["description"] = google_desc
                        updated_count += 1
                        print(f"     [+] Cập nhật thành công từ Google Search!")
                        continue
                
                print(f"     [-] Vẫn không thấy! Cuối cùng, hỏi trực tiếp Gemini...")
                gemini_desc = get_gemini_description(name)
                if gemini_desc != "N/A":
                    item["description"] = gemini_desc
                    updated_count += 1
                    print(f"     [+] Cập nhật thành công từ Gemini!")
                else:
                    print(f"     [-] Bó tay, kể cả Gemini cũng không tìm ra.")
                    
    if driver:
        try: driver.quit()
        except: pass
                
    save_json(filtered_data, FINAL_OUTPUT_FILE)
    print(f"✅ Xong Giai đoạn 3. Đã bổ sung/cập nhật {updated_count} mô tả.")
    return filtered_data


# GIAI ĐOẠN 4: TÌM ĐỊA CHỈ (OSM -> CÀO GOOGLE SEARCH -> GEMINI)

def translate_address_to_en(addr):
    if not addr or addr == "N/A": return "N/A"
    
    import unicodedata
    replacements = {
        r'\bPhường\b': 'Ward', r'\bphường\b': 'Ward',
        r'\bQuận\b': 'District', r'\bquận\b': 'District',
        r'\bHuyện\b': 'District', r'\bhuyện\b': 'District',
        r'\bThành phố\b': 'City', r'\bthành phố\b': 'City',
        r'\bTỉnh\b': 'Province', r'\btỉnh\b': 'Province',
        r'\bĐường\b': 'Street', r'\bđường\b': 'Street',
        r'\bThôn\b': 'Hamlet', r'\bthôn\b': 'Hamlet',
        r'\bXã\b': 'Commune', r'\bxã\b': 'Commune',
        r'\bThị trấn\b': 'Town',
        r'\bTổ\b': 'Group',
        r'\bQuốc lộ\b': 'National Highway',
        r'\bViệt Nam\b': 'Vietnam'
    }
    
    res = addr
    for vi, en in replacements.items():
        res = re.sub(vi, en, res, flags=re.IGNORECASE)
        
    res = res.replace('Đ', 'D').replace('đ', 'd')
    res = unicodedata.normalize('NFKD', res).encode('ascii', 'ignore').decode('utf-8')
    return res

def get_osm_address(location_name):
    url = "https://nominatim.openstreetmap.org/search"
    query = f"{location_name} {LOCATION}, Vietnam" 
    params = {"q": query, "format": "json", "addressdetails": 1, "limit": 1, "accept-language": "en"}
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 TripDataBot/1.0", "Accept-Language": "en-US,en"}
    
    for attempt in range(3):
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    addr = data[0].get("display_name", "N/A")
                    return translate_address_to_en(addr)
                return "N/A"
            elif response.status_code == 429:
                time.sleep(3 * (attempt + 1))
            else:
                time.sleep(2)
        except requests.exceptions.RequestException:
            time.sleep(2)
    return "N/A"

def get_address_from_google_search(driver, location_name):
    try:
        query = f"{location_name} address in english"
        url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&hl=en"
        driver.get(url)
        time.sleep(3) 
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        address_tag = soup.select_one('div[data-attrid="kc:/location/location:address"]')
        if address_tag:
            addr = address_tag.get_text(separator=' ', strip=True).replace('Địa chỉ:', '').replace('Address:', '').strip()
            if len(addr) > 5:
                return translate_address_to_en(addr)
                
        for tag in soup.select('.LrzXr'):
            addr = tag.get_text(strip=True)
            if len(addr) > 10 and ',' in addr:
                return translate_address_to_en(addr)
                
        for block in soup.find_all(string=re.compile(r'^(Address|Địa chỉ)[\s:]+', re.IGNORECASE)):
            parent = block.parent
            text = parent.get_text(separator=' ', strip=True)
            addr = re.sub(r'^(Address|Địa chỉ)[\s:]+', '', text, flags=re.IGNORECASE).strip()
            if len(addr) > 5:
                return translate_address_to_en(addr)

    except Exception:
        pass
        
    return "N/A"

def get_gemini_address(location_name):
    try:
        client = genai.Client(api_key=GEMINI_API_KEY.strip())
        prompt = f"What is the full address of the place '{location_name}' in {LOCATION}, Vietnam? Return ONLY the address in English, without any other text or explanation. If you don't know, return exactly 'N/A'. Do not include prefixes like 'Address:'."
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        addr = response.text.replace("Address:", "").strip(' "\'\n\t')
        if len(addr) > 5 and addr != "N/A" and "does not exist" not in addr.lower():
            return addr
    except Exception as e:
        pass
    return "N/A"

def phase_4_fill_address(filtered_data):
    print("\n" + "="*50)
    print("🗺️ GIAI ĐOẠN 4: ĐIỀN ĐỊA CHỈ (CƠ CHẾ 3 LỚP TÌM KIẾM)")
    print("="*50)
    
    need_browser = any(item.get("address") == "N/A" or not item.get("address") for item in filtered_data)
    driver = None
    if need_browser:
        print("🚀 Đang khởi động lại Chrome để cào Google Search (Lớp 2)...")
        driver = init_driver()
        
    updated_count = 0
    for item in filtered_data:
        if item.get("address") == "N/A" or not item.get("address"):
            name = item.get("location_name")
            print(f"  -> Tra cứu Address: {name}")
            
            address = get_osm_address(name)
            
            if address == "N/A" and driver:
                print("     [*] Đang bóc tách thông tin tổng quan từ Google Search AI...")
                address = get_address_from_google_search(driver, name)
                
            if address == "N/A":
                address = get_gemini_address(name)
                if address != "N/A":
                    print("     [*] Đã dùng AI Gemini dự đoán làm cứu cánh cuối cùng.")
            
            if address != "N/A":
                item["address"] = address
                updated_count += 1
                print(f"     [+] Đã tìm thấy: {address[:50]}...")
            else:
                print(f"     [-] Bó tay! Không tìm thấy địa chỉ ở cả 3 hệ thống.")
                
            time.sleep(1.5) 
            
    if driver:
        try: driver.quit()
        except: pass
        
    save_json(filtered_data, FINAL_OUTPUT_FILE)
    print(f"✅ Xong Giai đoạn 4. Đã bổ sung bằng API & AI được {updated_count} địa chỉ.")
    return filtered_data

def clean_address(raw_address):
    if not raw_address or raw_address == "N/A":
        return raw_address
    
    address_str = str(raw_address)
    
    cleaned = re.sub(r'^(Address\s*[:\-]?\s*)', '', address_str, flags=re.IGNORECASE)
    cleaned = cleaned.strip(' ,.\t\n')
    
    vn_chars = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ"
    if any(c in cleaned.lower() for c in vn_chars):
        cleaned = translate_address_to_en(cleaned)
            
    return cleaned


# GIAI ĐOẠN 5: LỌC CUỐI CÙNG VÀ LÀM SẠCH ĐỊA CHỈ

def phase_5_filter_missing_address(filtered_data):
    print("\n" + "="*50)
    print("🗑️ GIAI ĐOẠN 5: LÀM SẠCH CHUỖI VÀ LỌC BỎ ĐỊA ĐIỂM KHÔNG CÓ ĐỊA CHỈ")
    print("="*50)
    
    final_valid_data = []
    removed_count = 0
    cleaned_count = 0
    
    for item in filtered_data:
        raw_addr = item.get("address", "N/A")
        
        cleaned_addr = clean_address(raw_addr)
        
        if cleaned_addr == "N/A" or not str(cleaned_addr).strip():
            removed_count += 1
            print(f"  [-] XÓA SỔ: {item.get('location_name')} (Lý do: Tàng hình, không có địa chỉ hợp lệ)")
        else:
            if raw_addr != cleaned_addr:
                cleaned_count += 1
                
            item["address"] = cleaned_addr
            final_valid_data.append(item)

    save_json(final_valid_data, FINAL_OUTPUT_FILE)
    
    print(f"\n🎉 HOÀN TẤT CHIẾN DỊCH 5 GIAI ĐOẠN!")
    print(f"📊 Đã xóa vĩnh viễn {removed_count} địa điểm không xác định được vị trí.")
    print(f"✨ Đã gọt sạch tiền tố 'Địa chỉ:' cho {cleaned_count} địa điểm.")
    print(f"💾 Dữ liệu tuyệt đối sạch sẽ (Còn lại {len(final_valid_data)} địa điểm) đã được lưu tại: {FINAL_OUTPUT_FILE}")
    
    return final_valid_data


# THỰC THI TOÀN BỘ PIPELINE

if __name__ == "__main__":
    if GEMINI_API_KEY == "ĐIỀN_API_KEY_VÀO_ĐÂY" or not GEMINI_API_KEY.strip():
        print("\n❌ Bạn quên điền GEMINI API Key ở đầu file rồi kìa! Hãy điền vào để AI có thể hoạt động.")
        sys.exit()
        
    print("🚀 KHỞI ĐỘNG HỆ THỐNG TỰ ĐỘNG HÓA 5 TRONG 1")
    
    # 1. Cào Web
    raw_data = phase_1_crawl()
    
    # 2. Lọc bằng AI
    filtered_data = phase_2_filter(raw_data)

    if filtered_data:
        # 3. Đắp Description
        filtered_data = phase_3_fill_description(filtered_data)
        
        # 4. Đắp Address bằng 3 lớp bảo vệ
        filtered_data = phase_4_fill_address(filtered_data)
        
        # 5. Lọc rác cuối cùng
        filtered_data = phase_5_filter_missing_address(filtered_data)
    else:
        print("❌ Dữ liệu trống, không thể chạy các bước cuối cùng.")