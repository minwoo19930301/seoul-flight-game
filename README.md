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
- `A/D` 또는 `ArrowLeft/ArrowRight`: 좌우 기울기
- `Q/E`: 보조 러더
- `Shift`: 가속
- `Space`: 수평 복귀
- `R`: 처음 위치
- 모바일: `기수 +/-`, `좌뱅크`, `우뱅크`, `러더`, `BOOST`, `LEVEL` 버튼 지원

## Run

```bash
python3 -m http.server 5174 --bind 127.0.0.1 --directory "/Users/minwokim/Documents/New project/seoul-flight-game"
```

브라우저: `http://127.0.0.1:5174`

## Deploy

- GitHub Pages: [https://minwoo19930301.github.io/seoul-flight-game/](https://minwoo19930301.github.io/seoul-flight-game/)
- 루트 `index.html`은 `index-seoul-flight.html`로 redirect 됩니다.

## Files

- `index.html`: 진입용 redirect 페이지
- `index-seoul-flight.html`: HUD, 미니맵, 시작 패널, 터치 컨트롤 UI
- `seoul-flight.mjs`: Three.js 렌더링, 비행 로직, 체크포인트, HUD 갱신
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