// Seoul landmark registry: one hand-curated entry per landmark, covering all 25 districts.
// Used by scripts/generate-landmark-stubs.mjs to create landmarks/<id>.mjs files.
// Coordinates were verified against OpenStreetMap (Nominatim) - see scripts/README notes.
//
// detail: "high" = individually modelled with many distinctive features,
//         "medium" = recognisable massing with key features,
//         "low"    = simple but faithful massing.

export const DISTRICTS = [
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구", "강북구", "도봉구",
  "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구",
  "관악구", "서초구", "강남구", "송파구", "강동구",
];

export const LANDMARKS = [
  // ── 종로구 ──────────────────────────────────────────────────────────────
  { id: "gyeongbokgung", name: "경복궁", nameEn: "Gyeongbokgung Palace", district: "종로구", lat: 37.5776, lon: 126.9770, detail: "high", height: 32, colliderRadius: 88, description: "조선 법궁. 광화문-흥례문-근정문-근정전 축과 경회루" },
  { id: "cheongwadae", name: "청와대", nameEn: "Cheong Wa Dae (Blue House)", district: "종로구", lat: 37.5866, lon: 126.9748, detail: "medium", height: 24, colliderRadius: 42, description: "청기와 팔작지붕의 본관과 좌우 별관" },
  { id: "changdeokgung", name: "창덕궁", nameEn: "Changdeokgung Palace", district: "종로구", lat: 37.5794, lon: 126.9910, detail: "medium", height: 26, colliderRadius: 56, description: "돈화문과 인정전, 유네스코 세계유산 궁궐" },
  { id: "jongmyo", name: "종묘", nameEn: "Jongmyo Shrine", district: "종로구", lat: 37.5745, lon: 126.9940, detail: "low", height: 18, colliderRadius: 60, description: "101m 길이 단일 지붕의 정전과 월대" },
  { id: "jongno-tower", name: "종로타워", nameEn: "Jongno Tower", district: "종로구", lat: 37.5704, lon: 126.9830, detail: "high", height: 132, colliderRadius: 30, description: "상부가 떠 있는 탑클라우드 링 구조의 33층 오피스" },
  { id: "heunginjimun", name: "흥인지문", nameEn: "Heunginjimun Gate (Dongdaemun)", district: "종로구", lat: 37.5712, lon: 127.0095, detail: "medium", height: 22, colliderRadius: 34, description: "옹성이 둘러싼 2층 문루의 동대문" },
  { id: "jogyesa", name: "조계사", nameEn: "Jogyesa Temple", district: "종로구", lat: 37.5741, lon: 126.9818, detail: "low", height: 20, colliderRadius: 30, description: "대한불교조계종 총본산 대웅전과 회화나무" },
  { id: "sejong-center", name: "세종문화회관", nameEn: "Sejong Center", district: "종로구", lat: 37.5723, lon: 126.9760, detail: "low", height: 30, colliderRadius: 46, description: "열주가 늘어선 화강석 파사드의 공연장" },

  // ── 중구 ────────────────────────────────────────────────────────────────
  { id: "sungnyemun", name: "숭례문", nameEn: "Sungnyemun Gate (Namdaemun)", district: "중구", lat: 37.5599, lon: 126.9753, detail: "high", height: 24, colliderRadius: 30, description: "국보 1호, 석축 위 2층 문루" },
  { id: "seoul-city-hall", name: "서울시청", nameEn: "Seoul City Hall", district: "중구", lat: 37.5665, lon: 126.9780, detail: "high", height: 48, colliderRadius: 46, description: "파도 형상 유리 신청사와 르네상스식 구청사(서울도서관)" },
  { id: "deoksugung", name: "덕수궁", nameEn: "Deoksugung Palace", district: "중구", lat: 37.5659, lon: 126.9745, detail: "medium", height: 22, colliderRadius: 40, description: "중화전과 신고전주의 석조전" },
  { id: "myeongdong-cathedral", name: "명동성당", nameEn: "Myeongdong Cathedral", district: "중구", lat: 37.5633, lon: 126.9874, detail: "high", height: 47, colliderRadius: 30, description: "고딕 양식 벽돌 성당, 45m 첨탑" },
  { id: "seoul-station", name: "서울역(문화역서울284)", nameEn: "Seoul Station (Old Station Hall)", district: "중구", lat: 37.5559, lon: 126.9700, detail: "medium", height: 34, colliderRadius: 44, description: "비잔틴 돔의 붉은 벽돌 구역사와 유리 곡면 신역사" },
  { id: "ddp", name: "DDP 동대문디자인플라자", nameEn: "Dongdaemun Design Plaza", district: "중구", lat: 37.5668, lon: 127.0093, detail: "high", height: 30, colliderRadius: 62, description: "자하 하디드의 유선형 알루미늄 패널 건축" },
  { id: "jangchung-arena", name: "장충체육관", nameEn: "Jangchung Arena", district: "중구", lat: 37.5583, lon: 127.0068, detail: "low", height: 28, colliderRadius: 34, description: "국내 최초 돔 실내체육관" },
  { id: "bank-of-korea", name: "한국은행 화폐박물관", nameEn: "Bank of Korea Money Museum", district: "중구", lat: 37.5601, lon: 126.9819, detail: "medium", height: 26, colliderRadius: 34, description: "1912년 르네상스 양식 석조 건물" },
  { id: "namsangol-hanok", name: "남산골한옥마을", nameEn: "Namsangol Hanok Village", district: "중구", lat: 37.5592, lon: 126.9943, detail: "low", height: 12, colliderRadius: 44, description: "이축 복원된 전통 한옥 5채와 정원" },

  // ── 용산구 ──────────────────────────────────────────────────────────────
  { id: "n-seoul-tower", name: "N서울타워", nameEn: "N Seoul Tower", district: "용산구", lat: 37.5512, lon: 126.9882, detail: "high", height: 236, colliderRadius: 30, description: "남산 정상의 236m 전파탑, 전망대와 회전 레스토랑" },
  { id: "national-museum-korea", name: "국립중앙박물관", nameEn: "National Museum of Korea", district: "용산구", lat: 37.5240, lon: 126.9803, detail: "medium", height: 44, colliderRadius: 80, description: "404m 길이의 수평 매스와 열린 중앙 마당(열린마당)" },
  { id: "war-memorial", name: "전쟁기념관", nameEn: "War Memorial of Korea", district: "용산구", lat: 37.5365, lon: 126.9773, detail: "medium", height: 36, colliderRadius: 66, description: "반원형 열주 회랑과 중앙 돔형 본관" },
  { id: "amorepacific-hq", name: "아모레퍼시픽 본사", nameEn: "Amorepacific Headquarters", district: "용산구", lat: 37.5273, lon: 126.9698, detail: "high", height: 110, colliderRadius: 40, description: "치퍼필드의 정육면체, 세 개의 대형 개구부와 수직 핀" },
  { id: "seoul-dragon-city", name: "서울드래곤시티", nameEn: "Seoul Dragon City", district: "용산구", lat: 37.5294, lon: 126.9645, detail: "medium", height: 135, colliderRadius: 46, description: "스카이브리지 '스카이킹덤'으로 연결된 트윈 호텔 타워" },
  { id: "nodeul-island", name: "노들섬", nameEn: "Nodeul Island", district: "용산구", lat: 37.5176, lon: 126.9587, detail: "low", height: 14, colliderRadius: 54, description: "한강 위 문화섬, 저층 복합문화공간과 잔디밭" },

  // ── 성동구 ──────────────────────────────────────────────────────────────
  { id: "acro-seoul-forest", name: "아크로 서울포레스트", nameEn: "Acro Seoul Forest", district: "성동구", lat: 37.5445, lon: 127.0430, detail: "medium", height: 199, colliderRadius: 48, description: "서울숲 옆 199m 트윈 주거 타워" },
  { id: "hanyang-univ", name: "한양대학교", nameEn: "Hanyang University", district: "성동구", lat: 37.5578, lon: 127.0453, detail: "low", height: 32, colliderRadius: 46, description: "언덕 위 캠퍼스, 석조 본관과 사자상" },
  { id: "eungbong-pavilion", name: "응봉산 팔각정", nameEn: "Eungbongsan Octagonal Pavilion", district: "성동구", lat: 37.5487, lon: 127.0287, detail: "low", height: 12, colliderRadius: 18, description: "개나리 명소 응봉산 정상의 팔각정" },

  // ── 광진구 ──────────────────────────────────────────────────────────────
  { id: "technomart", name: "강변 테크노마트", nameEn: "Technomart (Gangbyeon)", district: "광진구", lat: 37.5355, lon: 127.0949, detail: "medium", height: 155, colliderRadius: 48, description: "39층 전자상가 복합 타워" },
  { id: "walkerhill", name: "그랜드 워커힐 서울", nameEn: "Grand Walkerhill Seoul", district: "광진구", lat: 37.5549, lon: 127.1075, detail: "medium", height: 60, colliderRadius: 56, description: "아차산 자락의 리조트 호텔 단지" },
  { id: "sejong-univ", name: "세종대학교", nameEn: "Sejong University", district: "광진구", lat: 37.5508, lon: 127.0738, detail: "low", height: 30, colliderRadius: 44, description: "궐(闕) 양식 정문과 전통 지붕의 박물관" },

  // ── 동대문구 ────────────────────────────────────────────────────────────
  { id: "kyunghee-peace-hall", name: "경희대 평화의전당", nameEn: "Kyung Hee Grand Peace Palace", district: "동대문구", lat: 37.5946, lon: 127.0520, detail: "high", height: 60, colliderRadius: 50, description: "고딕 성당 양식의 대형 공연장" },
  { id: "cheongnyangni-skyl65", name: "청량리역 롯데캐슬 SKY-L65", nameEn: "Cheongnyangni Lotte Castle SKY-L65", district: "동대문구", lat: 37.5800, lon: 127.0462, detail: "medium", height: 199, colliderRadius: 46, description: "청량리역 위 65층 4개동 주상복합" },
  { id: "univ-of-seoul", name: "서울시립대학교", nameEn: "University of Seoul", district: "동대문구", lat: 37.5835, lon: 127.0585, detail: "low", height: 28, colliderRadius: 42, description: "배봉산 아래 캠퍼스 본관" },

  // ── 중랑구 ──────────────────────────────────────────────────────────────
  { id: "yongma-falls", name: "용마폭포공원", nameEn: "Yongma Falls Park", district: "중랑구", lat: 37.5770, lon: 127.0893, detail: "medium", height: 51, colliderRadius: 40, description: "옛 채석장 절벽의 51m 인공폭포" },
  { id: "sangbong-emco", name: "상봉 프레미어스 엠코", nameEn: "Sangbong Premiers Emco", district: "중랑구", lat: 37.5972, lon: 127.0856, detail: "low", height: 150, colliderRadius: 40, description: "상봉역 위 45층 트윈 주상복합" },

  // ── 성북구 ──────────────────────────────────────────────────────────────
  { id: "korea-univ-main", name: "고려대학교 본관", nameEn: "Korea University Main Hall", district: "성북구", lat: 37.5893, lon: 127.0322, detail: "medium", height: 28, colliderRadius: 40, description: "1934년 고딕 화강석 본관과 중앙 탑" },
  { id: "samcheonggak", name: "삼청각", nameEn: "Samcheonggak", district: "성북구", lat: 37.5966, lon: 126.9897, detail: "low", height: 14, colliderRadius: 36, description: "북악 산자락 전통 한옥 문화공간 일화당" },
  { id: "gilsangsa", name: "길상사", nameEn: "Gilsangsa Temple", district: "성북구", lat: 37.6022, lon: 126.9946, detail: "low", height: 14, colliderRadius: 30, description: "성북동 산자락 사찰, 극락전" },

  // ── 강북구 ──────────────────────────────────────────────────────────────
  { id: "dream-forest-tower", name: "북서울꿈의숲 전망대", nameEn: "Dream Forest Observatory", district: "강북구", lat: 37.6215, lon: 127.0428, detail: "medium", height: 49, colliderRadius: 24, description: "공원 언덕 위 유리 전망타워" },
  { id: "april-19-cemetery", name: "국립4·19민주묘지", nameEn: "April 19th National Cemetery", district: "강북구", lat: 37.6485, lon: 127.0128, detail: "medium", height: 21, colliderRadius: 44, description: "7개 화강석 기둥의 상징탑과 묘역" },
  { id: "hwagyesa", name: "화계사", nameEn: "Hwagyesa Temple", district: "강북구", lat: 37.6362, lon: 127.0172, detail: "low", height: 16, colliderRadius: 30, description: "삼각산 자락 사찰, 대적광전과 범종각" },

  // ── 도봉구 ──────────────────────────────────────────────────────────────
  { id: "dobongsan-jaunbong", name: "도봉산 자운봉", nameEn: "Dobongsan Jaunbong Peak", district: "도봉구", lat: 37.6993, lon: 127.0145, detail: "medium", height: 90, colliderRadius: 70, description: "화강암 암봉 군(자운봉·만장봉·선인봉)" },
  { id: "dooly-museum", name: "둘리뮤지엄", nameEn: "Dooly Museum", district: "도봉구", lat: 37.6560, lon: 127.0190, detail: "low", height: 16, colliderRadius: 26, description: "쌍문동 아기공룡 둘리 테마 박물관" },
  { id: "banghak-ginkgo", name: "방학동 은행나무", nameEn: "Banghak-dong Ginkgo Tree", district: "도봉구", lat: 37.6661, lon: 127.0246, detail: "low", height: 25, colliderRadius: 20, description: "수령 600년, 높이 25m 서울시 보호수" },

  // ── 노원구 ──────────────────────────────────────────────────────────────
  { id: "taereung-skating", name: "태릉국제스케이트장", nameEn: "Taereung International Skating Rink", district: "노원구", lat: 37.6368, lon: 127.0796, detail: "medium", height: 26, colliderRadius: 70, description: "400m 트랙을 덮는 타원형 지붕" },
  { id: "seoultech", name: "서울과학기술대학교", nameEn: "Seoul National University of Science and Technology", district: "노원구", lat: 37.6320, lon: 127.0776, detail: "low", height: 20, colliderRadius: 46, description: "1940년대 붉은 벽돌 다산관·창학관" },
  { id: "seoul-science-center", name: "서울시립과학관", nameEn: "Seoul Science Center", district: "노원구", lat: 37.6390, lon: 127.0660, detail: "low", height: 20, colliderRadius: 34, description: "하계동 어린이 과학 체험관" },

  // ── 은평구 ──────────────────────────────────────────────────────────────
  { id: "eunpyeong-hanok", name: "은평한옥마을", nameEn: "Eunpyeong Hanok Village", district: "은평구", lat: 37.6396, lon: 126.9420, detail: "medium", height: 12, colliderRadius: 60, description: "북한산 아래 신축 한옥 마을" },
  { id: "jingwansa", name: "진관사", nameEn: "Jingwansa Temple", district: "은평구", lat: 37.6446, lon: 126.9494, detail: "low", height: 16, colliderRadius: 32, description: "북한산 서쪽 자락 천년 사찰" },

  // ── 서대문구 ────────────────────────────────────────────────────────────
  { id: "dongnimmun", name: "독립문", nameEn: "Dongnimmun (Independence Gate)", district: "서대문구", lat: 37.5744, lon: 126.9598, detail: "medium", height: 15, colliderRadius: 14, description: "1897년 화강석 개선문형 기념문" },
  { id: "seodaemun-prison", name: "서대문형무소역사관", nameEn: "Seodaemun Prison History Hall", district: "서대문구", lat: 37.5742, lon: 126.9560, detail: "medium", height: 14, colliderRadius: 48, description: "붉은 벽돌 옥사와 중앙사, 감시탑" },
  { id: "yonsei-underwood", name: "연세대학교 언더우드관", nameEn: "Yonsei University Underwood Hall", district: "서대문구", lat: 37.5656, lon: 126.9380, detail: "medium", height: 26, colliderRadius: 40, description: "1924년 고딕 석조 본관과 좌우 스팀슨관·아펜젤러관" },
  { id: "ewha-ecc", name: "이화여대 ECC", nameEn: "Ewha Campus Complex", district: "서대문구", lat: 37.5621, lon: 126.9464, detail: "high", height: 30, colliderRadius: 50, description: "도미니크 페로의 지하 유리 계곡과 언덕 위 파이퍼홀" },

  // ── 마포구 ──────────────────────────────────────────────────────────────
  { id: "seoul-world-cup-stadium", name: "서울월드컵경기장", nameEn: "Seoul World Cup Stadium", district: "마포구", lat: 37.5683, lon: 126.8972, detail: "high", height: 50, colliderRadius: 90, description: "방패연 형상의 막 구조 지붕, 16개 마스트" },
  { id: "haneul-park", name: "하늘공원", nameEn: "Haneul Park", district: "마포구", lat: 37.5666, lon: 126.8836, detail: "medium", height: 60, colliderRadius: 80, description: "난지도 매립지 위 억새 평원과 풍력발전기, '하늘을 담는 그릇'" },
  { id: "mbc-sangam", name: "MBC 상암", nameEn: "MBC Sangam Headquarters", district: "마포구", lat: 37.5816, lon: 126.8910, detail: "medium", height: 70, colliderRadius: 46, description: "미디어 파사드가 있는 두 매스와 광장" },
  { id: "hongik-univ", name: "홍익대학교", nameEn: "Hongik University", district: "마포구", lat: 37.5507, lon: 126.9254, detail: "low", height: 60, colliderRadius: 40, description: "정문의 홍문관과 언덕 위 캠퍼스" },

  // ── 양천구 ──────────────────────────────────────────────────────────────
  { id: "hyperion", name: "목동 하이페리온", nameEn: "Mok-dong Hyperion", district: "양천구", lat: 37.5265, lon: 126.8757, detail: "high", height: 256, colliderRadius: 46, description: "69층 256m 3개동 주거 타워" },
  { id: "mokdong-stadium", name: "목동종합운동장", nameEn: "Mokdong Stadium", district: "양천구", lat: 37.5296, lon: 126.8795, detail: "low", height: 24, colliderRadius: 60, description: "주경기장과 야구장, 아이스링크" },
  { id: "seoseoul-lake-park", name: "서서울호수공원", nameEn: "Seoseoul Lake Park", district: "양천구", lat: 37.5225, lon: 126.8340, detail: "low", height: 10, colliderRadius: 50, description: "옛 정수장 호수와 소리분수, 재생 정수장 구조물" },

  // ── 강서구 ──────────────────────────────────────────────────────────────
  { id: "gimpo-airport", name: "김포국제공항", nameEn: "Gimpo International Airport", district: "강서구", lat: 37.5594, lon: 126.7980, detail: "high", height: 60, colliderRadius: 120, description: "국내선·국제선 터미널과 관제탑" },
  { id: "seoul-botanic-park", name: "서울식물원", nameEn: "Seoul Botanic Park Greenhouse", district: "강서구", lat: 37.5695, lon: 126.8347, detail: "high", height: 28, colliderRadius: 50, description: "오목한 접시형 유리 온실" },
  { id: "lg-science-park", name: "LG사이언스파크", nameEn: "LG Science Park", district: "강서구", lat: 37.5619, lon: 126.8334, detail: "medium", height: 50, colliderRadius: 90, description: "마곡 연구단지, 유리 큐브 연구동 군" },
  { id: "yangcheon-hyanggyo", name: "양천향교", nameEn: "Yangcheon Hyanggyo", district: "강서구", lat: 37.5665, lon: 126.8476, detail: "low", height: 12, colliderRadius: 26, description: "서울 유일의 향교, 명륜당과 대성전" },

  // ── 구로구 ──────────────────────────────────────────────────────────────
  { id: "gocheok-skydome", name: "고척스카이돔", nameEn: "Gocheok Sky Dome", district: "구로구", lat: 37.4982, lon: 126.8671, detail: "high", height: 68, colliderRadius: 80, description: "국내 첫 돔 야구장, 흰색 돔 지붕" },
  { id: "dcube-city", name: "디큐브시티", nameEn: "D-Cube City", district: "구로구", lat: 37.5087, lon: 126.8895, detail: "medium", height: 168, colliderRadius: 50, description: "신도림 42층 곡면 타워와 저층 몰" },

  // ── 금천구 ──────────────────────────────────────────────────────────────
  { id: "mario-outlet", name: "마리오아울렛", nameEn: "Mario Outlet", district: "금천구", lat: 37.4780, lon: 126.8859, detail: "low", height: 60, colliderRadius: 56, description: "가산디지털단지의 3개관 아울렛" },
  { id: "lotte-castle-goldpark", name: "롯데캐슬 골드파크", nameEn: "Lotte Castle Gold Park", district: "금천구", lat: 37.4683, lon: 126.8990, detail: "low", height: 145, colliderRadius: 60, description: "독산동 초고층 주거 단지" },

  // ── 영등포구 ────────────────────────────────────────────────────────────
  { id: "sixty-three", name: "63빌딩", nameEn: "63 Building", district: "영등포구", lat: 37.5199, lon: 126.9403, detail: "high", height: 250, colliderRadius: 34, description: "1985년, 황금색 유리 커튼월의 여의도 상징" },
  { id: "national-assembly", name: "국회의사당", nameEn: "National Assembly Building", district: "영등포구", lat: 37.5319, lon: 126.9140, detail: "high", height: 70, colliderRadius: 66, description: "24개 열주와 청록색 돔" },
  { id: "parc1-ifc", name: "파크원·IFC서울", nameEn: "Parc1 & IFC Seoul", district: "영등포구", lat: 37.5255, lon: 126.9253, detail: "high", height: 333, colliderRadius: 52, description: "빨간 기둥의 파크원 트윈타워와 IFC 3개 타워" },
  { id: "yoido-full-gospel", name: "여의도순복음교회", nameEn: "Yoido Full Gospel Church", district: "영등포구", lat: 37.5293, lon: 126.9225, detail: "medium", height: 40, colliderRadius: 30, description: "돔형 대성전, 세계 최대 단일 교회" },
  { id: "times-square", name: "타임스퀘어", nameEn: "Times Square Yeongdeungpo", district: "영등포구", lat: 37.5172, lon: 126.9034, detail: "low", height: 60, colliderRadius: 60, description: "영등포 대형 복합쇼핑몰과 호텔 타워" },

  // ── 동작구 ──────────────────────────────────────────────────────────────
  { id: "national-cemetery", name: "국립서울현충원", nameEn: "Seoul National Cemetery", district: "동작구", lat: 37.5004, lon: 126.9730, detail: "medium", height: 31, colliderRadius: 60, description: "현충문과 31m 현충탑" },
  { id: "noryangjin-market", name: "노량진수산시장", nameEn: "Noryangjin Fish Market", district: "동작구", lat: 37.5138, lon: 126.9405, detail: "low", height: 22, colliderRadius: 46, description: "2016년 신축 수산시장 건물" },
  { id: "chung-ang-univ", name: "중앙대학교", nameEn: "Chung-Ang University", district: "동작구", lat: 37.5049, lon: 126.9568, detail: "low", height: 30, colliderRadius: 44, description: "영신관과 언덕 위 캠퍼스" },
  { id: "boramae-park", name: "보라매공원", nameEn: "Boramae Park", district: "동작구", lat: 37.4928, lon: 126.9195, detail: "low", height: 20, colliderRadius: 50, description: "옛 공군사관학교 터, 에어파크 전시 항공기와 음악분수" },

  // ── 관악구 ──────────────────────────────────────────────────────────────
  { id: "snu-main-gate", name: "서울대학교 정문", nameEn: "Seoul National University Main Gate", district: "관악구", lat: 37.4659, lon: 126.9485, detail: "medium", height: 22, colliderRadius: 30, description: "'샤' 형태의 상징 조형 정문" },
  { id: "nakseongdae", name: "낙성대", nameEn: "Nakseongdae", district: "관악구", lat: 37.4701, lon: 126.9618, detail: "low", height: 12, colliderRadius: 30, description: "강감찬 장군 사당 안국사와 삼층석탑" },
  { id: "gwanaksan-yeonjudae", name: "관악산 연주대", nameEn: "Gwanaksan Yeonjudae", district: "관악구", lat: 37.4434, lon: 126.9635, detail: "medium", height: 60, colliderRadius: 50, description: "암봉 절벽 위 응진전과 기상관측소" },

  // ── 서초구 ──────────────────────────────────────────────────────────────
  { id: "seoul-arts-center", name: "예술의전당", nameEn: "Seoul Arts Center", district: "서초구", lat: 37.4788, lon: 127.0122, detail: "high", height: 40, colliderRadius: 70, description: "갓 모양 오페라하우스와 부채꼴 음악당" },
  { id: "sebitseom", name: "세빛섬", nameEn: "Sebitseom (Floating Islands)", district: "서초구", lat: 37.5120, lon: 126.9953, detail: "high", height: 24, colliderRadius: 50, description: "한강 위 세 개의 인공섬(가빛·채빛·솔빛)" },
  { id: "samsung-town", name: "삼성타운", nameEn: "Samsung Town (Seocho)", district: "서초구", lat: 37.4970, lon: 127.0276, detail: "high", height: 203, colliderRadius: 50, description: "서초 삼성전자 사옥 A·B·C 3개 타워" },
  { id: "supreme-court", name: "대법원", nameEn: "Supreme Court of Korea", district: "서초구", lat: 37.4958, lon: 127.0054, detail: "medium", height: 40, colliderRadius: 50, description: "화강석 대법정 매스와 수평 청사" },
  { id: "central-city", name: "센트럴시티·신세계강남", nameEn: "Central City & Shinsegae Gangnam", district: "서초구", lat: 37.5043, lon: 127.0046, detail: "medium", height: 140, colliderRadius: 66, description: "JW메리어트 호텔 타워와 신세계백화점, 고속버스터미널" },
  { id: "kyobo-tower", name: "교보타워", nameEn: "Kyobo Tower (Gangnam)", district: "서초구", lat: 37.5048, lon: 127.0244, detail: "medium", height: 117, colliderRadius: 30, description: "마리오 보타의 붉은 테라코타 트윈 매스" },

  // ── 강남구 ──────────────────────────────────────────────────────────────
  { id: "coex-trade-tower", name: "COEX·트레이드타워", nameEn: "COEX & Trade Tower", district: "강남구", lat: 37.5100, lon: 127.0596, detail: "high", height: 228, colliderRadius: 80, description: "계단식 파사드의 55층 트레이드타워와 코엑스 전시장" },
  { id: "bongeunsa", name: "봉은사", nameEn: "Bongeunsa Temple", district: "강남구", lat: 37.5151, lon: 127.0574, detail: "medium", height: 23, colliderRadius: 40, description: "23m 미륵대불과 대웅전" },
  { id: "seonjeongneung", name: "선정릉", nameEn: "Seonjeongneung Royal Tombs", district: "강남구", lat: 37.5089, lon: 127.0478, detail: "low", height: 10, colliderRadius: 50, description: "조선 왕릉, 홍살문과 정자각, 봉분" },
  { id: "tower-palace", name: "타워팰리스", nameEn: "Tower Palace", district: "강남구", lat: 37.4878, lon: 127.0548, detail: "high", height: 264, colliderRadius: 60, description: "73층 264m G동을 포함한 초고층 주거 타워 군" },
  { id: "galleria-west", name: "갤러리아 명품관 WEST", nameEn: "Galleria Department Store West", district: "강남구", lat: 37.5279, lon: 127.0400, detail: "medium", height: 30, colliderRadius: 30, description: "4,330개 유리 디스크 파사드" },
  { id: "gfc", name: "강남파이낸스센터", nameEn: "Gangnam Finance Center", district: "강남구", lat: 37.5003, lon: 127.0367, detail: "medium", height: 206, colliderRadius: 36, description: "45층 206m 유리 커튼월 오피스" },

  // ── 송파구 ──────────────────────────────────────────────────────────────
  { id: "lotte-world-tower", name: "롯데월드타워", nameEn: "Lotte World Tower", district: "송파구", lat: 37.5126, lon: 127.1027, detail: "high", height: 555, colliderRadius: 46, description: "555m 123층, 붓끝 형상의 테이퍼드 타워" },
  { id: "lotte-world-magic-island", name: "롯데월드 매직아일랜드", nameEn: "Lotte World Magic Island", district: "송파구", lat: 37.5100, lon: 127.0990, detail: "high", height: 45, colliderRadius: 50, description: "석촌호수 위 매직캐슬과 어드벤처 유리 돔" },
  { id: "jamsil-sports-complex", name: "잠실종합운동장", nameEn: "Jamsil Sports Complex", district: "송파구", lat: 37.5140, lon: 127.0724, detail: "high", height: 50, colliderRadius: 100, description: "88올림픽 주경기장과 잠실야구장" },
  { id: "world-peace-gate", name: "세계평화의문", nameEn: "World Peace Gate", district: "송파구", lat: 37.5205, lon: 127.1166, detail: "high", height: 24, colliderRadius: 30, description: "올림픽공원 입구의 날개 형상 문, 단청" },
  { id: "hanseong-baekje-museum", name: "한성백제박물관", nameEn: "Seoul Baekje Museum", district: "송파구", lat: 37.5158, lon: 127.1150, detail: "low", height: 20, colliderRadius: 40, description: "배 형상의 경사 지붕 박물관" },
  { id: "garden-five", name: "가든파이브", nameEn: "Garden Five", district: "송파구", lat: 37.4780, lon: 127.1235, detail: "low", height: 60, colliderRadius: 80, description: "문정동 대형 복합 유통단지" },

  // ── 강동구 ──────────────────────────────────────────────────────────────
  { id: "amsa-prehistoric-site", name: "암사동 선사유적지", nameEn: "Amsa-dong Prehistoric Settlement Site", district: "강동구", lat: 37.5577, lon: 127.1317, detail: "medium", height: 10, colliderRadius: 50, description: "신석기 움집 복원 마을과 전시관" },
  { id: "samsung-engineering-gec", name: "삼성엔지니어링 GEC", nameEn: "Samsung Engineering Global Engineering Center", district: "강동구", lat: 37.5560, lon: 127.1607, detail: "low", height: 60, colliderRadius: 60, description: "상일동 대형 연구·사무 캠퍼스" },
  { id: "gangdong-arts-center", name: "강동아트센터", nameEn: "Gangdong Arts Center", district: "강동구", lat: 37.5476, lon: 127.1586, detail: "low", height: 22, colliderRadius: 40, description: "명일근린공원 옆 공연장" },
];

export default LANDMARKS;
