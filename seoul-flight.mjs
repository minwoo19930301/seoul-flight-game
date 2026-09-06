import * as THREE from "./vendor/three.module.js";
import { controlByCode, FlightInputs, updateAttitude, yawToTarget } from "./flight-model.mjs";
import { localMetreProjection } from "./geographic-model.mjs";
import { sampleLocalElevation } from "./terrain-model.mjs";
import { GLTFLoader } from "./vendor/loaders/GLTFLoader.js";
import { makeWaterGeometry } from "./water-geometry.mjs";
import { CityStream } from "./city-stream.mjs";
import { createTerrainGeometry } from "./terrain-geometry.mjs";
import { projectWater } from "./water-model.mjs";

const dom = {
  root: document.getElementById("game-root"),
  speedValue: document.getElementById("speed-value"),
  altitudeValue: document.getElementById("altitude-value"),
  headingValue: document.getElementById("heading-value"),
  headingCardinal: document.getElementById("heading-cardinal"),
  timerValue: document.getElementById("timer-value"),
  targetName: document.getElementById("target-name"),
  distanceValue: document.getElementById("distance-value"),
  bearingValue: document.getElementById("bearing-value"),
  statusText: document.getElementById("status-text"),
  startPanel: document.getElementById("start-panel"),
  startBtn: document.getElementById("start-btn"),
  messagePanel: document.getElementById("message-panel"),
  messageTag: document.getElementById("message-tag"),
  messageTitle: document.getElementById("message-title"),
  messageBody: document.getElementById("message-body"),
  restartBtn: document.getElementById("restart-btn"),
  pauseBtn: document.getElementById("pause-btn"),
  resumeBtn: document.getElementById("resume-btn"),
  progressValue: document.getElementById("progress-value"),
  targetAltitude: document.getElementById("target-altitude"),
  horizonInner: document.getElementById("horizon-inner"),
  mapCredit: document.getElementById("map-credit"),
  miniMap: document.getElementById("mini-map"),
  touchButtons: Array.from(document.querySelectorAll("[data-control]")),
};

const world = {
  width: 3200,
  depth: 2300,
  ceiling: 1000,
  boundaryPadding: 140,
};

const riverWidth = 284;
let riverPath = [];
let hillDefs = [];
let noBuildZones = [];
let districtDefs = [];
let landmarkDefs = [];
let checkpointDefs = [];
let bridgeDefs = [];


const state = {
  mode: "intro",
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  forward: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  roll: 0,
  speed: 0,
  elapsedMs: 0,
  checkpointIndex: 0,
};

const inputController = new FlightInputs();
const input = inputController.state;

const runtime = {
  scene: null,
  camera: null,
  renderer: null,
  sun: null,
  cockpitLight: null,
  skyGroup: null,
  riverMesh: null,
  riverGlowMesh: null,
  towerBeacon: null,
  lastTime: performance.now(),
  checkpointGroups: [],
  clouds: [],
  riverSamples: [],
  waterData: null,
  boundaryBeacons: [],
  projectedMap: null,
  rasterMapImage: null,
  miniMapBase: null,
  pointerLocked: false,
  lookRollVelocity: 0,
  currentStatus: "서울 상공 뷰를 준비 중입니다.",
  frameId: null,
  terrain: null,
  landmarkReferences: null,
  city: null,
  lastCityUpdate: 0,
};

const urlParams = new URLSearchParams(window.location.search);

dom.statusText.textContent = "서울 공역 로딩 중...";

try {
  await init();
} catch (error) {
  showFatalError(error);
}

async function init() {
  const mapData = await loadMapData();
  [runtime.terrain,runtime.landmarkReferences,runtime.waterData]=await Promise.all([
    loadJson("./assets/terrain/elevation.json"),loadJson("./assets/landmarks/references.json"),
    loadJson("./assets/water/water.geojson"),
  ]);
  runtime.rasterMapImage = await loadRasterMapImage();
  configureSeoulMap(mapData);
  buildMiniMapBase();
  setupThree();
  await buildWorld();
  bindEvents();
  resetFlight();
  dom.mapCredit.textContent = `${mapData.attribution} · Terrain: USGS / Mapzen · 일반 건물 높이·외관 추정`;
  dom.startBtn.disabled = false;
  dom.startBtn.textContent = "둘러보기 시작";
  if (urlParams.get("autostart") === "1") {
    startGame();
  }
  updateHud();
  runtime.frameId = requestAnimationFrame(loop);
}

function showFatalError(error) {
  console.error(error);
  state.mode = "error";
  clearInputs();
  cancelAnimationFrame(runtime.frameId);
  const message = error instanceof Error ? error.message : String(error);
  runtime.currentStatus = `초기화 오류: ${message}`;
  dom.startPanel.classList.add("hidden");
  dom.messageTag.textContent = "SYSTEM";
  dom.messageTitle.textContent = "초기화 오류";
  dom.messageBody.textContent = message;
  dom.messagePanel.classList.remove("hidden");
  dom.pauseBtn.disabled = true;
  dom.resumeBtn.hidden = true;
  dom.restartBtn.textContent = "다시 불러오기";
  dom.restartBtn.onclick = () => window.location.reload();
  updateHud();
}

async function loadMapData() {
  const response = await fetch("./assets/seoul-scene-data.json");
  if (!response.ok) {
    throw new Error(`Map data load failed (${response.status})`);
  }
  return response.json();
}

async function loadJson(url){const response=await fetch(url);if(!response.ok)throw new Error(`자료 로딩 실패: ${url} (${response.status})`);return response.json();}

async function loadRasterMapImage() {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => {
      console.warn("Raster map image unavailable. Falling back to vector texture.");
      resolve(null);
    };
    image.src = "./assets/seoul-raster-map.png";
  });
}

function configureSeoulMap(mapData) {
  const { project, width, depth } = localMetreProjection(mapData.bbox);
  world.width = width + 1000;
  world.depth = depth + 1000;

  runtime.projectedMap = {
    rasterBounds: {
      northWest: project(mapData.bbox.minLon, mapData.bbox.maxLat),
      southEast: project(mapData.bbox.maxLon, mapData.bbox.minLat),
    },
    attribution: mapData.attribution,
    waterPolygons: projectWater(runtime.waterData,project),
    waterLines: mapData.waterLines.map((points) => projectLine(points, project)),
    roads: {
      trunk: mapData.roads.trunk.map((points) => projectLine(points, project)),
      primary: mapData.roads.primary.map((points) => projectLine(points, project)),
      secondary: mapData.roads.secondary.map((points) => projectLine(points, project)),
    },
    route: projectLine(mapData.route.points, project),
    buildings: mapData.buildings.map((building) => projectBuilding(building, project)).filter(Boolean),
  };

  riverPath = pickLongestLine(runtime.projectedMap.waterLines).map(([x, z]) => new THREE.Vector2(x, z));
  if (riverPath.length < 2) {
    throw new Error("River path missing from map data");
  }


  landmarkDefs=runtime.landmarkReferences.landmarks.map(reference=>({
    id:reference.id,label:reference.nameKo,height:reference.dimensionsM.height,
    colliderRadius:Math.hypot(reference.dimensionsM.width,reference.dimensionsM.depth)/2,
    yaw:THREE.MathUtils.degToRad(reference.yawDegFromEast||0),osmWayId:reference.osmWayId,
    ...project(reference.coordinate.lon,reference.coordinate.lat),
  }));
  checkpointDefs=landmarkDefs.map(landmark=>({
    name:landmark.label,x:landmark.x,z:landmark.z,
    y:getTerrainHeight(landmark.x,landmark.z)+landmark.height+75,
    radius:180,note:`${landmark.label} 상공 · 높이와 외관의 근거는 자료 안내에서 확인하세요.`,
  }));
  dom.miniMap.height=Math.round(dom.miniMap.width*world.depth/world.width);

}

function setupThree() {
  const renderer = new THREE.WebGLRenderer({
    antialias: (window.devicePixelRatio || 1) <= 1.5,
    alpha: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
    precision: "highp",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  dom.root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0a877);
  scene.fog = new THREE.Fog(0xd9927e, 6000, 22000);

  const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.5, 36000);
  camera.position.set(0, 200, 0);

  const hemi = new THREE.HemisphereLight(0x7c6f9e, 0x2c2438, 1.5);
  scene.add(hemi);

  // Magic-hour sun: low elevation (~8deg above horizon) at a fixed azimuth.
  const sunAzimuth = THREE.MathUtils.degToRad(-25);
  const sunElevation = THREE.MathUtils.degToRad(8);
  const sunDistance = 1080;
  const sun = new THREE.DirectionalLight(0xffb066, 2.4);
  sun.position.set(
    Math.cos(sunElevation) * Math.sin(sunAzimuth) * sunDistance,
    Math.sin(sunElevation) * sunDistance,
    Math.cos(sunElevation) * Math.cos(sunAzimuth) * sunDistance,
  );
  scene.add(sun);

  const cockpitLight = new THREE.PointLight(0x8fe7ff, 0.48, 320);
  camera.add(cockpitLight);
  scene.add(camera);

  runtime.renderer = renderer;
  runtime.scene = scene;
  runtime.camera = camera;
  runtime.sun = sun;
  runtime.cockpitLight = cockpitLight;
}

async function buildWorld() {
  const scene = runtime.scene;

  const groundTexture = createGroundTexture();
  const terrainGeometry=createTerrainGeometry(runtime.terrain,world.width,world.depth);
  const ground = new THREE.Mesh(
    terrainGeometry,
    new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.98,
      metalness: 0.04,
    }),
  );
  scene.add(ground);

  const river = createRiverMesh();
  scene.add(river);
  runtime.riverMesh = river;

  createSky(scene);
  // DEM surface replaces randomly offset cone mountains.
  await createLandmarks(scene);
  await createCityTiles(scene);
  // Legacy bridge pylons and lengths were invented; source roads remain on the map.
  // No invented perimeter skyscrapers: the skyline follows the source footprint set.
  createCheckpoints(scene);
  createClouds(scene);
}

function createSky(scene) {
  const skyGroup = new THREE.Group();

  const sunDirection = runtime.sun.position.clone().normalize();

  const skyGeometry = new THREE.SphereGeometry(30000, 32, 15);
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      zenithColor: { value: new THREE.Color(0x2e3c6e) },
      upperColor: { value: new THREE.Color(0x5a5f9e) },
      lowColor: { value: new THREE.Color(0xc97f8e) },
      horizonColor: { value: new THREE.Color(0xf7b26a) },
      scatterColor: { value: new THREE.Color(0xffd9a0) },
      sunDir: { value: sunDirection },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      uniform vec3 zenithColor;
      uniform vec3 upperColor;
      uniform vec3 lowColor;
      uniform vec3 horizonColor;
      uniform vec3 scatterColor;
      uniform vec3 sunDir;
      void main() {
        vec3 dir = normalize(vWorldPosition-cameraPosition);
        float h = dir.y;
        vec3 lowMix = mix(horizonColor, lowColor, smoothstep(0.0, 0.22, h));
        vec3 midMix = mix(lowMix, upperColor, smoothstep(0.22, 0.55, h));
        vec3 color = mix(midMix, zenithColor, smoothstep(0.55, 0.9, h));

        float scatter = pow(max(dot(dir, normalize(sunDir)), 0.0), 3.0) * 0.6;
        color = mix(color, scatterColor, scatter);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  skyGroup.add(sky);

  const sunCanvas = document.createElement("canvas");
  sunCanvas.width = 256;
  sunCanvas.height = 256;
  const sunCtx = sunCanvas.getContext("2d");
  const sunGradient = sunCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
  sunGradient.addColorStop(0, "rgba(255, 243, 208, 0.98)");
  sunGradient.addColorStop(0.32, "rgba(255, 210, 150, 0.68)");
  sunGradient.addColorStop(0.62, "rgba(255, 158, 94, 0.32)");
  sunGradient.addColorStop(1, "rgba(255, 158, 94, 0)");
  sunCtx.fillStyle = sunGradient;
  sunCtx.fillRect(0, 0, sunCanvas.width, sunCanvas.height);

  const sunTexture = new THREE.CanvasTexture(sunCanvas);
  sunTexture.colorSpace = THREE.SRGBColorSpace;
  const sunMaterial = new THREE.SpriteMaterial({
    map: sunTexture,
    transparent: true,
    depthWrite: false,
    fog: false,
  });
  const sunSprite = new THREE.Sprite(sunMaterial);
  sunSprite.scale.set(3600, 3600, 1);
  sunSprite.position.copy(sunDirection).multiplyScalar(26000);
  skyGroup.add(sunSprite);

  scene.add(skyGroup);
  runtime.skyGroup = skyGroup;
}

function buildMiniMapBase() {
  const base = document.createElement("canvas");
  base.width = dom.miniMap.width;
  base.height = dom.miniMap.height;
  const ctx = base.getContext("2d");
  const map = runtime.projectedMap;

  if (runtime.rasterMapImage) {
    drawRasterMap(ctx, base);
    ctx.fillStyle = "rgba(7, 14, 24, 0.16)";
    ctx.fillRect(0, 0, base.width, base.height);
  } else {
    ctx.fillStyle = "#09131b";
    ctx.fillRect(0, 0, base.width, base.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    for (let x = 0; x <= base.width; x += 32) {
      ctx.fillRect(x, 0, 1, base.height);
    }
    for (let y = 0; y <= base.height; y += 32) {
      ctx.fillRect(0, y, base.width, 1);
    }

    map.waterPolygons.forEach((polygon) => drawWaterPolygon(ctx, base, polygon, "rgba(48, 121, 212, 0.95)"));
    map.buildings.forEach((building) => {
      if (building.area < 280 && building.height < 28) {
        return;
      }
      drawMiniMapPolygon(ctx, base, building.points, building.height >= 90 ? "rgba(187, 220, 255, 0.34)" : "rgba(226, 236, 242, 0.16)");
    });
    map.roads.primary.forEach((line) => drawMiniMapLine(ctx, base, line, 2.2, "rgba(255, 224, 157, 0.15)"));
    map.roads.trunk.forEach((line) => drawMiniMapLine(ctx, base, line, 3, "rgba(255, 200, 120, 0.24)"));
  }
  runtime.miniMapBase = base;
}

function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 3072;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  const map = runtime.projectedMap;

  if (runtime.rasterMapImage) {
    ctx.save();
    ctx.filter = "contrast(1.1) saturate(0.82) brightness(0.78)";
    drawRasterMap(ctx, canvas);
    ctx.restore();

    // Dusk wash: multiply toward deep purple-mauve.
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(122, 106, 136, 0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Warm sun-facing tint patch (sun azimuth ~ -25deg -> biased toward left/upper of texture).
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    const sunTint = ctx.createRadialGradient(
      canvas.width * 0.32, canvas.height * 0.28, 0,
      canvas.width * 0.32, canvas.height * 0.28, canvas.width * 0.65,
    );
    sunTint.addColorStop(0, "rgba(201, 138, 106, 0.55)");
    sunTint.addColorStop(1, "rgba(201, 138, 106, 0)");
    ctx.fillStyle = sunTint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const wash = ctx.createLinearGradient(0, 0, 0, canvas.height);
    wash.addColorStop(0, "rgba(18, 14, 30, 0.1)");
    wash.addColorStop(0.5, "rgba(14, 10, 24, 0.18)");
    wash.addColorStop(1, "rgba(16, 12, 26, 0.26)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1f3329");
    gradient.addColorStop(0.42, "#16281f");
    gradient.addColorStop(1, "#101c16");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.08;
    for (let x = 0; x <= canvas.width; x += 96) {
      ctx.fillStyle = x % 192 === 0 ? "#8db36f" : "#74935d";
      ctx.fillRect(x, 0, 2, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += 96) {
      ctx.fillStyle = y % 192 === 0 ? "#8db36f" : "#74935d";
      ctx.fillRect(0, y, canvas.width, 2);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    map.buildings.forEach((building) => {
      const fill = building.height >= 120
        ? "rgba(210, 230, 255, 0.18)"
        : building.height >= 60
          ? "rgba(176, 196, 214, 0.14)"
          : "rgba(128, 146, 160, 0.12)";
      drawPolygon(ctx, canvas, building.points, fill);
    });
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 34;
    ctx.shadowColor = "rgba(58, 164, 255, 0.42)";
    map.waterPolygons.forEach((polygon) => {
      drawWaterPolygon(ctx, canvas, polygon, "rgba(38, 92, 174, 0.96)");
    });
    map.waterPolygons.forEach((polygon) => {
      drawWaterPolygon(ctx, canvas, polygon, "rgba(114, 194, 255, 0.38)");
    });
    ctx.restore();

    drawProjectedFeatureSet(ctx, canvas, map.roads.secondary, 5, "rgba(255, 226, 163, 0.1)");
    drawProjectedFeatureSet(ctx, canvas, map.roads.primary, 9, "rgba(253, 228, 172, 0.18)");
    drawProjectedFeatureSet(ctx, canvas, map.roads.trunk, 13, "rgba(255, 210, 138, 0.28)");
  }

  // Source raster already contains bridges; no metre-to-pixel decorative overlays.

  if (!runtime.rasterMapImage) {
    ctx.fillStyle = "rgba(255, 232, 208, 0.95)";
    ctx.font = '700 64px "Orbitron", sans-serif';
    ctx.fillText("SEOUL AIR TOUR", 86, 110);
  }

  ctx.save();
  ctx.strokeStyle = "rgba(36, 20, 20, 0.55)";
  ctx.lineWidth = 4;
  ctx.fillStyle = "rgba(255, 232, 208, 0.92)";
  ctx.font = '700 44px "IBM Plex Sans KR", sans-serif';
  landmarkDefs.forEach((landmark) => {
    const position = worldToTexture(landmark.x, landmark.z - 84, canvas);
    ctx.textAlign = "center";
    ctx.strokeText(landmark.label.toUpperCase(), position.x, position.y);
    ctx.fillText(landmark.label.toUpperCase(), position.x, position.y);
  });
  ctx.restore();
  const riverMid = riverPath[Math.floor(riverPath.length * 0.52)];
  if (riverMid) {
    ctx.save();
    ctx.strokeStyle = "rgba(36, 20, 20, 0.55)";
    ctx.lineWidth = 4;
    const position = worldToTexture(riverMid.x, riverMid.y, canvas);
    ctx.textAlign = "center";
    ctx.strokeText("HAN RIVER", position.x, position.y);
    ctx.fillStyle = "rgba(255, 224, 200, 0.95)";
    ctx.fillText("HAN RIVER", position.x, position.y);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = runtime.renderer.capabilities.getMaxAnisotropy();
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRiverMesh() {
  const geometry=makeWaterGeometry(runtime.projectedMap.waterPolygons,{
    minX:-runtime.terrain.projectedWidthM/2,maxX:runtime.terrain.projectedWidthM/2,
    minZ:-runtime.terrain.projectedDepthM/2,maxZ:runtime.terrain.projectedDepthM/2,
  },getTerrainHeight,{columns:runtime.terrain.width-1,rows:runtime.terrain.height-1});
  return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({
    color:0x4a7588,roughness:.38,metalness:.15,side:THREE.DoubleSide,
  }));
}






async function createCityTiles(scene){
  const manifest=await loadJson('./assets/city/manifest.json');
  const loader=new GLTFLoader();
  runtime.city=new CityStream(manifest.tiles,{
    load:async tile=>(await loader.loadAsync(`./assets/city/${tile.url}`)).scene,
    attach:(object,tile)=>{object.position.fromArray(tile.origin);scene.add(object);},
    dispose:object=>{
      scene.remove(object);const geometries=new Set(),materials=new Set(),textures=new Set();
      object.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const material of (Array.isArray(node.material)?node.material:[node.material]))if(material){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
      for(const geometry of geometries)geometry.dispose();
      for(const material of materials)material.dispose();
      for(const texture of textures){texture.source?.data?.close?.();texture.dispose();}
    },
    onStatus:({ready,total,failed})=>{
      const label=document.getElementById('asset-status');
      label.textContent=failed?`건물 자료 ${failed}구역 로드 실패 · R로 재시도`:`주변 건물 ${ready} / ${total}구역 · 이동하면 다음 구역을 불러옵니다.`;
    },
  });
  const first=checkpointDefs[0];
  await runtime.city.update({x:first.x-360,z:first.z+36});
}







async function createLandmarks(scene) {
  const loader=new GLTFLoader();
  await Promise.all(landmarkDefs.map(async landmark=>{
    const terrainHeight = getTerrainHeight(landmark.x, landmark.z);
    const {scene:group}=await loader.loadAsync(`./assets/landmarks/${landmark.id}.glb`);
    group.position.set(landmark.x, terrainHeight, landmark.z);
    group.rotation.y=landmark.yaw;
    scene.add(group);

    const label = createLabelSprite(landmark.label, "#ffe8d0");
    label.position.set(landmark.x, terrainHeight + landmark.height + 32, landmark.z);
    scene.add(label);
  }));
}



function createCheckpoints(scene) {
  void scene;
  runtime.checkpointGroups = [];
}

function createClouds(scene) {
  const rng = mulberry32(4096);
  const cloudTexture = createCloudPuffTexture();

  for (let index = 0; index < 26; index += 1) {
    const cloud = new THREE.Group();
    const puffCount = 4 + Math.floor(rng() * 3);

    for (let puff = 0; puff < puffCount; puff += 1) {
      const material = new THREE.SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.55 + rng() * 0.25,
      });
      const sprite = new THREE.Sprite(material);
      const scale = 60 + rng() * 80;
      sprite.scale.set(scale, scale * (0.62 + rng() * 0.14), 1);
      sprite.position.set((rng() - 0.5) * 90, (rng() - 0.5) * 20, (rng() - 0.5) * 30);
      cloud.add(sprite);
    }

    cloud.position.set(
      -world.width * 0.5 + rng() * world.width,
      320 + rng() * 230,
      -world.depth * 0.5 + rng() * world.depth,
    );
    cloud.userData.speed = 4 + rng() * 9;
    runtime.clouds.push(cloud);
    scene.add(cloud);
  }
}

function createCloudPuffTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.6)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tint = ctx.createLinearGradient(0, 0, 0, canvas.height);
  tint.addColorStop(0, "rgba(205, 191, 232, 0.55)");
  tint.addColorStop(1, "rgba(255, 201, 160, 0.55)");
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}






function createLabelSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(36, 26, 26, 0.72)";
  roundRect(ctx, 20, 20, 472, 88, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 184, 122, 0.44)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = '700 48px "IBM Plex Sans KR", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(124, 31, 1);
  return sprite;
}

function bindEvents() {
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  document.addEventListener("pointerlockchange", handlePointerLockChange);
  document.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("blur", pauseFlight);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseFlight();
  });
  runtime.renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    showFatalError(new Error("3D 화면 연결이 끊겼습니다. 다시 불러오면 비행을 시작할 수 있습니다."));
  });

  dom.startBtn.addEventListener("click", () => {
    startGame();
    requestFlightPointerLock();
  });

  dom.restartBtn.addEventListener("click", () => {
    if (state.mode === "error") return;
    resetFlight();
    startGame();
    requestFlightPointerLock();
  });
  dom.pauseBtn.addEventListener("click", pauseFlight);
  dom.resumeBtn.addEventListener("click", () => {
    startGame();
    requestFlightPointerLock();
  });

  runtime.renderer.domElement.addEventListener("click", () => {
    if (state.mode === "running") {
      requestFlightPointerLock();
    }
  });

  dom.touchButtons.forEach((button) => {
    const control = button.dataset.control;
    const activate = (event) => {
      if (state.mode !== "running") return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      inputController.set(control, `pointer:${event.pointerId}`, true);
      button.classList.add("active");
    };
    const deactivate = (event) => {
      event.preventDefault();
      inputController.set(control, `pointer:${event.pointerId}`, false);
      button.classList.toggle("active", input[control]);
    };

    button.addEventListener("pointerdown", activate);
    button.addEventListener("pointerup", deactivate);
    button.addEventListener("pointercancel", deactivate);
    button.addEventListener("lostpointercapture", deactivate);
  });
}

function requestFlightPointerLock() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (runtime.renderer?.domElement && document.pointerLockElement !== runtime.renderer.domElement) {
    try {
      runtime.renderer.domElement.requestPointerLock?.()?.catch(() => {
        runtime.currentStatus = "마우스 조종을 사용할 수 없습니다. W/S, A/D, Q/E로 조종하세요.";
      });
    } catch {
      runtime.currentStatus = "키보드 W/S, A/D, Q/E로 조종하세요.";
    }
  }
}

function handlePointerLockChange() {
  const wasLocked = runtime.pointerLocked;
  runtime.pointerLocked = document.pointerLockElement === runtime.renderer?.domElement;
  if (wasLocked && !runtime.pointerLocked) pauseFlight();
}

function handleMouseMove(event) {
  if (!runtime.pointerLocked || state.mode !== "running") {
    return;
  }

  state.yaw -= event.movementX * 0.0022;
  state.pitch -= event.movementY * 0.0016;
  state.pitch = THREE.MathUtils.clamp(state.pitch, -0.48, 0.58);
  runtime.lookRollVelocity = THREE.MathUtils.clamp(event.movementX * 0.0026, -0.45, 0.45);
}

function onResize() {
  runtime.camera.aspect = window.innerWidth / window.innerHeight;
  runtime.camera.updateProjectionMatrix();
  runtime.renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
  if (state.mode === "error") return;
  if (event.target instanceof Element) {
    if (event.target.closest("input, select, textarea, [contenteditable]")) return;
    if (event.target.closest("button") && ["Enter", "Space"].includes(event.code)) return;
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }

  if (event.repeat) {
    return;
  }

  if (event.code === "KeyP" || event.code === "Escape") {
    event.preventDefault();
    if (state.mode === "paused") startGame();
    else pauseFlight();
    return;
  }

  if (event.code === "KeyR") {
    const shouldResume = state.mode !== "intro";
    resetFlight();
    if (shouldResume) {
      startGame();
    }
    return;
  }

  if (event.code === "Enter" && (state.mode === "intro" || state.mode === "paused")) {
    startGame();
  }

  if (state.mode === "running") setInputByCode(event.code, true);
}

function handleKeyUp(event) {
  setInputByCode(event.code, false);
}

function setInputByCode(code, active) {
  inputController.set(controlByCode[code], `key:${code}`, active);
}

function resetFlight() {
  clearInputs();
  document.exitPointerLock?.();
  runtime.pointerLocked = false;
  const firstCheckpoint = checkpointDefs[0];
  const startX = Math.max(-world.width * 0.5 + world.boundaryPadding + 20, firstCheckpoint.x - 360);
  const startZ = firstCheckpoint.z + 36;
  state.mode = "intro";
  state.position.set(startX, firstCheckpoint.y, startZ);
  if(runtime.city){runtime.city.retry();runtime.city.update(state.position);}
  state.yaw = yawToTarget(state.position, firstCheckpoint);
  state.pitch = 0;
  state.roll = 0;
  state.speed = 68;
  state.elapsedMs = 0;
  state.checkpointIndex = 0;
  runtime.lookRollVelocity = 0;

  runtime.currentStatus = "서울 상공 뷰 준비 완료. 시작하면 바로 이동합니다.";
  dom.startPanel.classList.remove("hidden");
  dom.messagePanel.classList.add("hidden");
  dom.pauseBtn.disabled = true;
  updateCheckpointVisuals();
  updateCamera(0);
  updateHud();
}

function startGame() {
  if (state.mode !== "intro" && state.mode !== "paused") {
    return;
  }

  state.mode = "running";
  runtime.lastTime = performance.now();
  dom.startPanel.classList.add("hidden");
  dom.messagePanel.classList.add("hidden");
  dom.pauseBtn.disabled = false;
  runtime.currentStatus = checkpointDefs[state.checkpointIndex]?.note || "서울 상공을 둘러보세요.";
  // Keep global keyboard controls available after activating a focused button.
  runtime.renderer.domElement.tabIndex = 0;
  runtime.renderer.domElement.focus({ preventScroll: true });
}

function pauseFlight() {
  clearInputs();
  if (state.mode !== "running") return;
  state.mode = "paused";
  document.exitPointerLock?.();
  dom.pauseBtn.disabled = true;
  runtime.currentStatus = "일시정지 · 이어서 비행하면 같은 위치에서 계속합니다.";
  dom.messageTag.textContent = "PAUSED";
  dom.messageTitle.textContent = "비행을 잠시 멈췄습니다.";
  dom.messageBody.textContent = "위치와 둘러본 랜드마크를 보관했습니다. 이어서 비행하거나 처음부터 다시 시작하세요.";
  dom.resumeBtn.hidden = false;
  dom.restartBtn.textContent = "처음부터 다시";
  dom.messagePanel.classList.remove("hidden");
}

function loop(now) {
  const delta = Math.max(0, Math.min((now - runtime.lastTime) / 1000, 0.05));
  runtime.lastTime = now;

  if (state.mode === "running") {
    state.elapsedMs += delta * 1000;
    updateFlight(delta);
    updateClouds(delta);
    if (state.mode === "running") {
      updateCheckpoints(now);
    }
  } else if (state.mode === "intro") {
    updateCamera(delta);
    updateClouds(delta);
  }

  updateHud();
  runtime.skyGroup.position.copy(runtime.camera.position);
  if(runtime.city&&now-runtime.lastCityUpdate>1000){runtime.lastCityUpdate=now;runtime.city.update(state.position);}
  if (runtime.towerBeacon) {
    runtime.towerBeacon.material.emissiveIntensity = 0.6 + 0.5 * Math.max(Math.sin(now * 0.0028), 0);
  }
  runtime.renderer.render(runtime.scene, runtime.camera);
  if (state.mode !== "error") runtime.frameId = requestAnimationFrame(loop);
}

function updateFlight(delta) {
  const targetSpeed = input.boost ? 116 : 74;
  state.speed = THREE.MathUtils.damp(state.speed, targetSpeed, 2.1, delta);
  updateAttitude(state, input, delta, runtime.lookRollVelocity, runtime.pointerLocked);
  runtime.lookRollVelocity = THREE.MathUtils.damp(runtime.lookRollVelocity, 0, 4.8, delta);

  const euler = new THREE.Euler(state.pitch, state.yaw, state.roll, "YXZ");
  state.forward.set(0, 0, -1).applyEuler(euler).normalize();
  state.position.addScaledVector(state.forward, state.speed * delta);

  const terrainHeight = getTerrainHeight(state.position.x, state.position.z);
  const floor = terrainHeight + 18;

  if (state.position.y < floor) {
    state.position.y = floor;
    state.pitch = Math.max(state.pitch, 0.05);
    state.roll = THREE.MathUtils.damp(state.roll, 0, 5.4, delta);
    runtime.currentStatus = "저고도. 자동으로 지면 위로 복귀 중.";
  }

  if (state.position.y > world.ceiling) {
    state.position.y = world.ceiling;
    state.pitch = Math.min(state.pitch, 0);
  }

  enforceBoundary(delta);
  updateCamera(delta);
}

function updateCamera(delta) {
  const euler = new THREE.Euler(state.pitch, state.yaw, state.roll, "YXZ");
  state.forward.set(0, 0, -1).applyEuler(euler).normalize();
  const cockpitOffset = new THREE.Vector3(0, 0, 0);
  const drift = new THREE.Vector3(0, Math.sin(performance.now() * 0.008) * 0.55, 0).multiplyScalar(state.mode === "running" ? 1 : 0.3);
  runtime.camera.position.copy(state.position).add(cockpitOffset).add(drift);
  runtime.camera.quaternion.setFromEuler(euler);

  const velocityTilt = Math.sin(performance.now() * 0.012) * (input.boost ? 0.002 : 0.001);
  runtime.camera.rotateZ(velocityTilt);
  runtime.cockpitLight.intensity = THREE.MathUtils.damp(runtime.cockpitLight.intensity, input.boost ? 0.65 : 0.48, 3, Math.max(delta, 0.016));
}

function updateClouds(delta) {
  runtime.clouds.forEach((cloud) => {
    cloud.position.x += cloud.userData.speed * delta;
    if (cloud.position.x > world.width * 0.5 + 140) {
      cloud.position.x = -world.width * 0.5 - 140;
    }
  });
}

function updateCheckpoints(now) {
  const current = checkpointDefs[state.checkpointIndex];
  if (!current) {
    return;
  }

  const distance = horizontalDistance(state.position.x, state.position.z, current.x, current.z);
  const altitudeDelta = Math.abs(state.position.y - current.y);

  if (distance < current.radius * 0.98 && altitudeDelta < 120) {
    state.checkpointIndex += 1;
    updateCheckpointVisuals();

    if (state.checkpointIndex >= checkpointDefs.length) {
      finishRun();
      return;
    }

    runtime.currentStatus = `${checkpointDefs[state.checkpointIndex].name} 방향으로 이동 중.`;
  } else {
    const relative = getRelativeBearing(current);
    if (!runtime.pointerLocked && window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) {
      runtime.currentStatus = "화면 클릭 후 마우스로 방향 조종";
    } else if (state.position.y < getTerrainHeight(state.position.x, state.position.z) + 56) {
      runtime.currentStatus = "저고도 경고. 기수를 올리세요.";
    } else if (Math.abs(relative) > 65) {
      runtime.currentStatus = "다음 랜드마크 방향으로 이동 중.";
    } else if (input.boost) {
      runtime.currentStatus = "부스트 사용 중. 고도 유지에 주의하세요.";
    } else {
      runtime.currentStatus = current.note;
    }
  }

  runtime.checkpointGroups.forEach((item) => {
    const pulse = 0.78 + Math.sin(now * 0.004 + item.index) * 0.1;
    if (item.index === state.checkpointIndex) {
      item.ring.rotation.z += 0.028;
      item.ring.material.emissiveIntensity = 1.4 * pulse;
      item.beam.material.opacity = 0.26 + Math.sin(now * 0.004 + item.index) * 0.05;
      item.glow.intensity = 1.9 * pulse;
    } else if (item.index < state.checkpointIndex) {
      item.ring.material.emissiveIntensity = 0.22;
      item.beam.material.opacity = 0.06;
      item.glow.intensity = 0.32;
    } else {
      item.ring.material.emissiveIntensity = 0.56;
      item.beam.material.opacity = 0.12;
      item.glow.intensity = 0.76;
    }
  });
}

function updateCheckpointVisuals() {
  runtime.checkpointGroups.forEach((item) => {
    if (item.index < state.checkpointIndex) {
      item.ring.material.color.setHex(0x88f2a1);
      item.ring.material.opacity = 0.55;
      item.beam.material.color.setHex(0x88f2a1);
      item.label.material.opacity = 0.82;
    } else if (item.index === state.checkpointIndex) {
      item.ring.material.color.setHex(0xb6f2ff);
      item.ring.material.opacity = 0.95;
      item.beam.material.color.setHex(0xb6f2ff);
      item.label.material.opacity = 1;
    } else {
      item.ring.material.color.setHex(0x8ceeff);
      item.ring.material.opacity = 0.74;
      item.beam.material.color.setHex(0x8ceeff);
      item.label.material.opacity = 0.78;
    }
  });
}

function updateHud() {
  const headingDegrees = normalizeDegrees(THREE.MathUtils.radToDeg(getHeadingRadians()));
  const current = checkpointDefs[state.checkpointIndex];
  const distance = current ? horizontalDistance(state.position.x, state.position.z, current.x, current.z) : 0;
  const relativeBearing = current ? getRelativeBearing(current) : 0;

  dom.speedValue.textContent = String(Math.round(state.speed * 3.6)).padStart(3, "0");
  dom.altitudeValue.textContent = String(Math.max(0, Math.round(state.position.y))).padStart(3, "0");
  dom.headingValue.textContent = String(Math.round(headingDegrees) % 360).padStart(3, "0");
  dom.headingCardinal.textContent = getCardinal(headingDegrees);
  dom.timerValue.textContent = formatTime(state.elapsedMs);
  dom.targetName.textContent = current ? current.name : "둘러보기 완료";
  dom.progressValue.textContent = `${Math.min(state.checkpointIndex, checkpointDefs.length)} / ${checkpointDefs.length}`;
  dom.targetAltitude.textContent = current ? `${current.y}m` : "—";
  dom.distanceValue.textContent = `${Math.round(distance)}m`;
  dom.bearingValue.textContent = `${Math.round(relativeBearing)}°`;
  dom.statusText.textContent = runtime.currentStatus;
  dom.horizonInner.style.transform = `translateY(${state.pitch * 120}px) rotate(${(-state.roll * 180) / Math.PI}deg)`;
  drawMiniMap();
}

function finishRun() {
  state.mode = "complete";
  clearInputs();
  document.exitPointerLock?.();
  dom.pauseBtn.disabled = true;
  runtime.currentStatus = "주요 랜드마크 안내를 모두 지났습니다.";
  dom.messageTag.textContent = "TOUR COMPLETE";
  dom.messageTitle.textContent = "서울의 다섯 랜드마크를 모두 둘러봤습니다.";
  dom.messageBody.textContent = `둘러본 곳 ${checkpointDefs.length}곳 · 비행 시간 ${formatTime(state.elapsedMs)}`;
  dom.resumeBtn.hidden = true;
  dom.restartBtn.textContent = "다시 둘러보기";
  dom.messagePanel.classList.remove("hidden");
  dom.restartBtn.focus({ preventScroll: true });
}

function enforceBoundary(delta) {
  const limitX = world.width * 0.5 - world.boundaryPadding;
  const limitZ = world.depth * 0.5 - world.boundaryPadding;
  const outsideX = Math.abs(state.position.x) > limitX;
  const outsideZ = Math.abs(state.position.z) > limitZ;

  if (!outsideX && !outsideZ) {
    return;
  }

  state.position.x = THREE.MathUtils.clamp(state.position.x, -limitX, limitX);
  state.position.z = THREE.MathUtils.clamp(state.position.z, -limitZ, limitZ);

  const desired = yawToTarget(state.position, { x: 0, z: 0 });
  const deltaAngle = shortestAngle(state.yaw, desired);
  state.yaw += deltaAngle * Math.min(1, delta * 1.8);
  runtime.currentStatus = "서울 지도 경계 접근. 지도 안쪽으로 복귀 중.";
}

function getTerrainHeight(x, z) {
  return sampleLocalElevation(runtime.terrain,x,z);
}




function isPointInPolygon(x, z, points) {
  let inside = false;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
    const [currentX, currentZ] = points[index];
    const [previousX, previousZ] = points[previous];
    const intersects = ((currentZ > z) !== (previousZ > z))
      && (x < ((previousX - currentX) * (z - currentZ)) / (previousZ - currentZ) + currentX);
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function rectanglesOverlap(minX1, maxX1, minZ1, maxZ1, minX2, maxX2, minZ2, maxZ2, margin = 0) {
  return !(
    maxX1 < minX2 - margin
    || minX1 > maxX2 + margin
    || maxZ1 < minZ2 - margin
    || minZ1 > maxZ2 + margin
  );
}

function getRelativeBearing(target) {
  const heading = getHeadingRadians();
  const bearing = Math.atan2(target.x - state.position.x, -(target.z - state.position.z));
  return THREE.MathUtils.radToDeg(shortestAngle(heading, bearing));
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getCardinal(deg) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(deg / 45) % 8];
}

function worldToTexture(x, z, canvas) {
  return {
    x: ((x + world.width * 0.5) / world.width) * canvas.width,
    y: ((z + world.depth * 0.5) / world.depth) * canvas.height,
  };
}

function drawRasterMap(ctx, canvas) {
  const bounds = runtime.projectedMap.rasterBounds;
  const start = worldToTexture(bounds.northWest.x, bounds.northWest.z, canvas);
  const end = worldToTexture(bounds.southEast.x, bounds.southEast.z, canvas);
  // The raster covers the geographic bbox, not the padded simulation world.
  // Use the same projection as buildings, roads and landmark positions.
  ctx.fillStyle = "#303442";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(runtime.rasterMapImage, start.x, start.y, end.x - start.x, end.y - start.y);
}

function placeLabel(ctx, canvas, text, x, z, color = "rgba(225, 242, 251, 0.62)") {
  const position = worldToTexture(x, z, canvas);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, position.x, position.y);
}

function drawProjectedLine(ctx, canvas, points, width, color) {
  ctx.beginPath();
  points.forEach((point, index) => {
    const position = worldToTexture(point[0], point[1], canvas);
    if (index === 0) {
      ctx.moveTo(position.x, position.y);
    } else {
      ctx.lineTo(position.x, position.y);
    }
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawProjectedFeatureSet(ctx, canvas, features, width, color) {
  ctx.save();
  features.forEach((feature) => {
    drawProjectedLine(ctx, canvas, feature, width, color);
  });
  ctx.restore();
}

function drawPolygon(ctx, canvas, points, color) {
  if (points.length < 3) {
    return;
  }
  ctx.beginPath();
  points.forEach((point, index) => {
    const position = worldToTexture(point[0], point[1], canvas);
    if (index === 0) {
      ctx.moveTo(position.x, position.y);
    } else {
      ctx.lineTo(position.x, position.y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawWaterPolygon(ctx,canvas,rings,color){
  ctx.beginPath();
  for(const ring of rings){
    ring.forEach(([x,z],index)=>{const p=worldToTexture(x,z,canvas);if(index===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
    ctx.closePath();
  }
  ctx.fillStyle=color;
  ctx.fill('evenodd');
}

function drawMiniMapLine(ctx, canvas, points, width, color) {
  ctx.beginPath();
  points.forEach((point, index) => {
    const position = worldToTexture(point[0], point[1], canvas);
    if (index === 0) {
      ctx.moveTo(position.x, position.y);
    } else {
      ctx.lineTo(position.x, position.y);
    }
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawMiniMapPolygon(ctx, canvas, points, color) {
  if (points.length < 3) {
    return;
  }
  ctx.beginPath();
  points.forEach((point, index) => {
    const position = worldToTexture(point[0], point[1], canvas);
    if (index === 0) {
      ctx.moveTo(position.x, position.y);
    } else {
      ctx.lineTo(position.x, position.y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawMiniMap() {
  const ctx = dom.miniMap.getContext("2d");
  if (!runtime.miniMapBase || !ctx) {
    return;
  }

  ctx.clearRect(0, 0, dom.miniMap.width, dom.miniMap.height);
  ctx.drawImage(runtime.miniMapBase, 0, 0);

  const player = worldToTexture(state.position.x, state.position.z, dom.miniMap);
  const current = checkpointDefs[state.checkpointIndex];
  if (current) {
    const target = worldToTexture(current.x, current.z, dom.miniMap);
    ctx.save();
    ctx.strokeStyle = "#ffe4a3";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.restore();
  }
  checkpointDefs.forEach((checkpoint, index) => {
    const point = worldToTexture(checkpoint.x, checkpoint.z, dom.miniMap);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = index < state.checkpointIndex ? "#88f2a1" : index === state.checkpointIndex ? "#ffe4a3" : "#b6eaff";
    ctx.fill();
    ctx.fillStyle = "#07131d";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(index + 1), point.x, point.y);
  });
  const heading = getHeadingRadians();
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(heading);
  ctx.fillStyle = "#ff8d64";
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(6, 7);
  ctx.lineTo(0, 4);
  ctx.lineTo(-6, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function projectLine(points, project) {
  return points.map(([lon, lat]) => {
    const projected = project(lon, lat);
    return [projected.x, projected.z];
  });
}

function projectBuilding(building, project) {
  if (!Array.isArray(building.points) || building.points.length < 3) {
    return null;
  }

  const points = [];
  building.points.forEach(([lon, lat]) => {
    const projected = project(lon, lat);
    const next = [projected.x, projected.z];
    const previous = points[points.length - 1];
    if (!previous || horizontalDistance(previous[0], previous[1], next[0], next[1]) > 1) {
      points.push(next);
    }
  });

  if (points.length > 2) {
    const first = points[0];
    const last = points[points.length - 1];
    if (horizontalDistance(first[0], first[1], last[0], last[1]) <= 1) {
      points.pop();
    }
  }

  if (points.length < 3) {
    return null;
  }

  const signedArea = polygonSignedArea(points);
  if (Math.abs(signedArea) < 10) {
    return null;
  }

  const centroid = polygonCentroid(points, signedArea);
  const footprintArea = Math.abs(signedArea);
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  let radius = 0;
  points.forEach(([x, z]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
    radius = Math.max(radius, horizontalDistance(x, z, centroid.x, centroid.z));
  });

  return {
    ...building,
    points,
    height: normalizeBuildingHeight(building),
    footprintArea,
    footprintWidth: Math.max(4, maxX - minX),
    footprintDepth: Math.max(4, maxZ - minZ),
    footprintMinX: minX,
    footprintMaxX: maxX,
    footprintMinZ: minZ,
    footprintMaxZ: maxZ,
    x: centroid.x,
    z: centroid.z,
    radius: Math.max(radius, 10),
  };
}

function normalizeBuildingHeight(building) {
  const explicitHeight = Number(building.height);
  if (Number.isFinite(explicitHeight) && explicitHeight > 0) {
    return THREE.MathUtils.clamp(explicitHeight, 8, 320);
  }

  const footprintArea = Math.max(0, Number(building.area) || 0);
  return THREE.MathUtils.clamp(10 + Math.sqrt(footprintArea) * 0.24, 8, 180);
}

function sampleRoutePoints(points, step = 1) {
  if (!points.length) {
    return [];
  }

  const sampled = [];
  for (let index = 0; index < points.length; index += step) {
    sampled.push(points[index]);
  }

  const last = points[points.length - 1];
  const sampledLast = sampled[sampled.length - 1];
  if (!sampledLast || sampledLast[0] !== last[0] || sampledLast[1] !== last[1]) {
    sampled.push(last);
  }

  return sampled;
}

function pickLongestLine(lines) {
  return lines.reduce((best, current) => {
    const bestLength = polylineLength(best);
    const currentLength = polylineLength(current);
    return currentLength > bestLength ? current : best;
  }, []);
}

function polylineLength(points) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += horizontalDistance(points[index - 1][0], points[index - 1][1], points[index][0], points[index][1]);
  }
  return total;
}

function polygonSignedArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x1, z1] = points[index];
    const [x2, z2] = points[(index + 1) % points.length];
    area += x1 * z2 - x2 * z1;
  }
  return area * 0.5;
}

function polygonBounds(points) {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  points.forEach(([x, z]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  });

  return { minX, maxX, minZ, maxZ };
}

function polygonCentroid(points, signedArea = polygonSignedArea(points)) {
  if (Math.abs(signedArea) < 1e-5) {
    const total = points.reduce((accumulator, [x, z]) => {
      accumulator.x += x;
      accumulator.z += z;
      return accumulator;
    }, { x: 0, z: 0 });
    return {
      x: total.x / points.length,
      z: total.z / points.length,
    };
  }

  let centroidX = 0;
  let centroidZ = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x1, z1] = points[index];
    const [x2, z2] = points[(index + 1) % points.length];
    const cross = x1 * z2 - x2 * z1;
    centroidX += (x1 + x2) * cross;
    centroidZ += (z1 + z2) * cross;
  }

  const factor = 1 / (6 * signedArea);
  return {
    x: centroidX * factor,
    z: centroidZ * factor,
  };
}

function mercatorX(lon) {
  return THREE.MathUtils.degToRad(lon);
}

function mercatorY(lat) {
  const radians = THREE.MathUtils.degToRad(lat);
  return Math.log(Math.tan(Math.PI * 0.25 + radians * 0.5));
}




function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function horizontalDistance(x1, z1, x2, z2) {
  return Math.hypot(x2 - x1, z2 - z1);
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function getHeadingRadians() {
  if (state.forward.lengthSq() > 0.0001) {
    return Math.atan2(state.forward.x, -state.forward.z);
  }
  return -state.yaw;
}

function shortestAngle(from, to) {
  let delta = (to - from + Math.PI) % (Math.PI * 2) - Math.PI;
  if (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return delta;
}

function clearInputs() {
  inputController.clear();
  runtime.lookRollVelocity = 0;
  dom.touchButtons.forEach((button) => {
    button.classList.remove("active");
  });
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let value = Math.imul(t ^ (t >>> 15), t | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashFrac(i) {
  const value = Math.sin(i * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}
