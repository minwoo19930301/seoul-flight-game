# Seoul Air Tour Viewer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://minwoo19930301.github.io/seoul-flight-game/)


서울 실제 도로, 한강, 주행 경로, 건물 풋프린트 데이터를 바탕으로 만든 1인칭 서울 상공 비행 뷰어입니다. HUD와 미니맵으로 주요 랜드마크 방향을 보면서 63빌딩, 경복궁, N서울타워, COEX, 롯데월드타워 순서로 천천히 둘러볼 수 있습니다.

## Links

- Live site: [Seoul Air Tour Viewer](https://minwoo19930301.github.io/seoul-flight-game/)
- GitHub: [minwoo19930301/seoul-flight-game](https://github.com/minwoo19930301/seoul-flight-game)

## How To Use

1. 사이트를 열고 시작 패널에서 `둘러보기 시작`을 누릅니다.
2. 화면을 클릭하면 마우스 기준으로 시점과 진행 방향을 조종할 수 있습니다.
3. HUD에서 속도, 고도, 방위, 현재 목표 랜드마크를 확인합니다.
4. 미니맵과 거리 표시를 보면서 다음 랜드마크 방향으로 이동합니다.
5. 필요하면 `R`로 처음 위치로 돌아가 다시 시작합니다.

## Features

- 실제 서울 도로/하천/주행 경로/건물 풋프린트 데이터 기반 미니맵 + 지면 텍스처
- 실제 OSM 건물 약 6.9만 동(아파트/주거 포함) 기반 3D 배치
- 실제 OSM 래스터 타일 기반 바닥/미니맵
- 랜드마크 순서 안내: `63빌딩 -> 경복궁 -> N서울타워 -> COEX -> 롯데월드타워`
- 1인칭 조종석 HUD 오버레이
- 속도, 고도, 방위, 목표 거리 표시
- 마우스 + 키보드 + 모바일 터치 조작 지원
- 지면/건물 충돌 없이 서울 상공을 천천히 둘러보는 비행 뷰어

## Controls

- 화면 클릭: 포인터 락 및 마우스 시점/방향 조종
- `W/S` 또는 `ArrowUp/ArrowDown`: 느리게 상승/하강
- `A/D` 또는 `ArrowLeft/ArrowRight`: 좌우 선회 (기울기와 진행 방향이 함께 바뀝니다)
- `Q/E`: 보조 러더
- `Shift`: 가속
- `Space`: 수평 복귀
- `R`: 처음 위치
- `P` 또는 `Esc`: 일시정지, `P` 또는 `Enter`: 이어서 비행
- 모바일: `기수 +/-`, `좌뱅크`, `우뱅크`, `러더`, `BOOST`, `LEVEL` 버튼 지원

다른 창이나 탭으로 이동하면 자동으로 일시정지하며, 돌아온 뒤 `이어서 비행`을
누르면 위치와 진행 상황이 유지됩니다. 미니맵의 번호 순서대로 이동하고 HUD의
목표 고도에 맞추면 방문으로 기록됩니다. 5곳을 모두 방문하면 완료 화면에서
다시 시작할 수 있습니다. 속도는 시뮬레이션 이동량을 km/h로 환산한 값이며,
고도·거리는 축소된 장면의 단위를 사용합니다.

## Run

```bash
python3 -m http.server 5174 --bind 127.0.0.1
```

브라우저: `http://127.0.0.1:5174`

저장소 루트에서 실행합니다. 외부 빌드 단계 없이 정적 파일을 제공합니다.

## Verify

```bash
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

단위 테스트는 나침반/Three.js 회전 방향, 선회·수평 복귀, 복수 키·터치 입력을
확인합니다. 브라우저 테스트는 임시 로컬 서버를 직접 띄워 실제 WebGL 시작,
키보드 조향, 일시정지/재개, 경계 복귀, 5곳 완료/재시작, 모바일 화면/포인터 캡처,
데이터 로딩 실패 후 복구를 확인합니다. 스크린샷은 `test-results/`에 저장됩니다.
설치된 Chrome을 사용하려면 `CHROME_CHANNEL=chrome npm run test:browser`로 실행합니다.

## Deploy

- GitHub Pages: [https://minwoo19930301.github.io/seoul-flight-game/](https://minwoo19930301.github.io/seoul-flight-game/)
- 루트 `index.html`은 `index-seoul-flight.html`로 redirect 됩니다.

## Files

- `index.html`: 진입용 redirect 페이지
- `index-seoul-flight.html`: HUD, 미니맵, 시작 패널, 터치 컨트롤 UI
- `seoul-flight.mjs`: Three.js 렌더링, 비행 로직, 체크포인트, HUD 갱신
- `flight-model.mjs`: 조향·방위 계산과 입력 상태 (단위 테스트 가능한 모듈)
- `seoul-flight.css`: 비행기 HUD 스타일
- `assets/seoul-scene-data.json`: 서울 실제 도로/하천/건물 데이터
- `assets/seoul-map-data.json`: 기본 서울 벡터 맵 원본
- `assets/seoul-raster-map.png`: 서울 실제 OSM 래스터 베이스맵
- `vendor/three.module.js`, `vendor/three.core.js`: Three.js 런타임

## 데이터

- 도로/하천/건물: OpenStreetMap / Overpass
- 경로: OSRM routing

## Regenerate Assets

- 래스터 베이스맵 재생성: `python3 scripts/build-osm-raster-map.py`
- 건물 데이터 재생성: `node scripts/rebuild-seoul-scene-buildings.mjs --osm /tmp/seoul_buildings_full_raw.json --out assets/seoul-scene-data.json --min-area 10`
