import * as THREE from "./vendor/three.module.js";
import { controlByCode, FlightInputs, formatMetres, updateAttitude, yawToTarget } from "./flight-model.mjs";
import { localMetreProjection } from "./geographic-model.mjs";
import { sampleLocalElevation } from "./terrain-model.mjs";
import { GLTFLoader } from "./vendor/loaders/GLTFLoader.js";
import { makeWaterGeometry } from "./water-geometry.mjs";
import { CityStream } from "./city-stream.mjs";
import { createTerrainGeometry } from "./terrain-geometry.mjs";
import { projectWater } from "./water-model.mjs";
import { validateSceneContract } from "./scene-contract.mjs";
import {loadCompressedJson} from './compressed-assets.mjs';
import {CityWorkerClient} from './city-worker-client.mjs';
import {terrainLod,safeFlightFloor} from './terrain-lod.mjs';

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
  districtSelect: document.getElementById('district-select'),
  districtGo: document.getElementById('district-go'),
  heightLegend: document.getElementById('height-legend'),
  touchButtons: Array.from(document.querySelectorAll("[data-control]")),
};

const world = {
  width: 0, // Set only after validating the complete source projection.
  depth: 0,
  ceiling: 1600,
  boundaryPadding: 50,
};

let riverPath = [];
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
  miniMapBase: null,
  pointerLocked: false,
  lookRollVelocity: 0,
  currentStatus: "서울 상공 뷰를 준비 중입니다.",
  frameId: null,
  terrain: null,
  landmarkReferences: null,
  city: null,
  cityManifest: null,
  lastCityUpdate: 0,
  renderTerrain: null,
  districts: null,
  cityWorker: null,
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
  [runtime.terrain,runtime.landmarkReferences,runtime.waterData,runtime.cityManifest,runtime.districts]=await Promise.all([
    loadCompressedJson("./assets/full-seoul/terrain/elevation.json.gz"),loadJson("./assets/landmarks/references.json"),
    loadCompressedJson("./assets/full-seoul/water/water.geojson.gz"),
    loadJson("./assets/full-seoul/city-manifest.json"),loadCompressedJson("./assets/full-seoul/districts.json.gz"),
  ]);
  validateSceneContract({map:mapData,terrain:runtime.terrain,city:runtime.cityManifest,
    districts:runtime.districts,references:runtime.landmarkReferences});
  runtime.renderTerrain=terrainLod(runtime.terrain,window.matchMedia('(max-width: 760px)').matches?280:420);
  configureSeoulMap(mapData);
  buildMiniMapBase();
  setupThree();
  await buildWorld();
  bindEvents();
  resetFlight();
  dom.heightLegend.textContent='청회색: 높이값 있음 26,626동(7.3%, 실측 보장 아님) · 회갈색: 나머지 338,830동은 층수×3.1m 또는 8m 추정. 부분 형상은 본체 높이 추정도 사용.';
  for(const district of districtDefs){const option=document.createElement('option');option.value=district.id;option.textContent=district.name;dom.districtSelect.appendChild(option);}
  dom.districtGo.disabled=false;
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
  const response = await fetch("./assets/full-seoul/scene.json");
  if (!response.ok) {
    throw new Error(`Map data load failed (${response.status})`);
  }
  return response.json();
}

async function loadJson(url){const response=await fetch(url);if(!response.ok)throw new Error(`자료 로딩 실패: ${url} (${response.status})`);return response.json();}


function configureSeoulMap(mapData) {
  const { project, width, depth } = localMetreProjection(mapData.bbox);
  world.width = width;
  world.depth = depth;
  districtDefs=mapData.districts??[];

  runtime.projectedMap = {
    attribution: mapData.attribution,
    waterPolygons: projectWater(runtime.waterData,project),
    waterLines: mapData.waterLines.map((points) => projectLine(points, project)),
    roads: {
      trunk: mapData.roads.trunk.map((points) => projectLine(points, project)),
      primary: mapData.roads.primary.map((points) => projectLine(points, project)),
      secondary: mapData.roads.secondary.map((points) => projectLine(points, project)),
    },
    route: projectLine(mapData.route.points, project),
    buildings: [],
    districtPolygons: runtime.districts?.features.map(f=>({id:f.id,polygons:projectWater({type:'FeatureCollection',features:[f]},project)}))??[],
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  dom.root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0a877);
  scene.fog = new THREE.Fog(0xd9927e, 9000, 40000);

  const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.5, 60000);
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
  const scene=runtime.scene;
  const geometry=createTerrainGeometry(runtime.renderTerrain,world.width,world.depth);
  const colors=[],position=geometry.getAttribute('position');
  const low=new THREE.Color(0x454c49),high=new THREE.Color(0xa69c87);
  for(let i=0;i<position.count;i++){const color=low.clone().lerp(high,THREE.MathUtils.clamp(position.getY(i)/850,0,1));colors.push(color.r,color.g,color.b);}
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  scene.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96,metalness:0})));
  const river=createRiverMesh();scene.add(river);runtime.riverMesh=river;
  // These are the retained central-Seoul road centrelines, not invented full-city streets.
  const roadPositions=[];
  for(const lines of Object.values(runtime.projectedMap.roads))for(const line of lines)for(let i=1;i<line.length;i++){
    const a=line[i-1],b=line[i],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/40));
    for(let step=0;step<steps;step++)for(const t of [step/steps,(step+1)/steps]){
      const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;roadPositions.push(x,sampleLocalElevation(runtime.renderTerrain,x,z)+.8,z);
    }
  }
  const roadGeometry=new THREE.BufferGeometry();roadGeometry.setAttribute('position',new THREE.Float32BufferAttribute(roadPositions,3));
  scene.add(new THREE.LineSegments(roadGeometry,new THREE.LineBasicMaterial({color:0xb5aca0,transparent:true,opacity:.42})));
  createSky(scene);
  await createLandmarks(scene);
  await createCityTiles(scene);
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
  const base=document.createElement('canvas');base.width=dom.miniMap.width;base.height=dom.miniMap.height;
  const ctx=base.getContext('2d');ctx.fillStyle='#172729';ctx.fillRect(0,0,base.width,base.height);
  for(const polygon of runtime.projectedMap.waterPolygons)drawWaterPolygon(ctx,base,polygon,'#427fa1');
  for(const district of runtime.projectedMap.districtPolygons)for(const polygon of district.polygons){
    for(const ring of polygon)drawMiniMapLine(ctx,base,ring,.65,'rgba(232,224,199,.62)');
  }
  for(const line of runtime.projectedMap.roads.trunk)drawMiniMapLine(ctx,base,line,.7,'rgba(255,200,140,.45)');
  runtime.miniMapBase=base;
}


function createRiverMesh() {
  const grid=runtime.renderTerrain;
  const geometry=makeWaterGeometry(runtime.projectedMap.waterPolygons,{
    minX:-grid.projectedWidthM/2,maxX:grid.projectedWidthM/2,minZ:-grid.projectedDepthM/2,maxZ:grid.projectedDepthM/2,
  },(x,z)=>sampleLocalElevation(grid,x,z),{columns:grid.width-1,rows:grid.height-1});
  return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0x4a7588,roughness:.38,metalness:.15,side:THREE.DoubleSide}));
}






async function createCityTiles(scene){
  const manifest=runtime.cityManifest;
  const mobile=window.matchMedia('(max-width:760px)').matches;
  const range=mobile?{near:1100,nearFade:[650,950],far:2800,farFade:[1800,2500]}:{near:1900,nearFade:[1300,1650],far:4300,farFade:[3200,3900]};
  const texture=new THREE.TextureLoader().load('./scripts/generic-window-original.png');
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=Math.min(4,runtime.renderer.capabilities.getMaxAnisotropy());
  const materials={};
  for(const lod of ['near','far']){
    const material=new THREE.MeshStandardMaterial({map:texture,vertexColors:true,roughness:.86,metalness:.04});
    const [begin,end]=range[lod+'Fade'];
    material.onBeforeCompile=shader=>{
      shader.uniforms.cityFade={value:new THREE.Vector2(begin,end)};
      shader.vertexShader='varying vec3 cityWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n cityWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader='varying vec3 cityWorld; uniform vec2 cityFade;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\n float cityD=length(cityWorld.xz-cameraPosition.xz); float cityAlpha=1.0-smoothstep(cityFade.x,cityFade.y,cityD); if(cityAlpha<fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)) discard;');
    };
    material.customProgramCacheKey=()=>lod+'-city-distance-fade';materials[lod]=material;
  }
  runtime.cityWorker=new CityWorkerClient(runtime.terrain);
  const tiles=manifest.tiles.flatMap(tile=>['near','far'].map(lod=>({...tile,id:tile.id+'/'+lod,lod,loadRadius:range[lod],releaseRadius:range[lod]+650})));
  runtime.city=new CityStream(tiles,{
    concurrency:3,
    load:async tile=>{
      const result=await runtime.cityWorker.load(tile),group=new THREE.Group();
      group.userData.stats=result.stats;
      for(const attributes of result.groups){
        if(!attributes.index.length)continue;
        const geometry=new THREE.BufferGeometry();
        for(const [key,size] of [['position',3],['normal',3],['uv',2],['color',3]])geometry.setAttribute(key,new THREE.BufferAttribute(attributes[key],size));
        geometry.setIndex(new THREE.BufferAttribute(attributes.index,1));geometry.computeBoundingSphere();geometry.computeBoundingBox();
        group.add(new THREE.Mesh(geometry,materials[tile.lod]));
      }
      return group;
    },
    attach:(object,tile)=>{object.position.fromArray(tile.origin);scene.add(object);},
    dispose:object=>{scene.remove(object);object.traverse(node=>node.geometry?.dispose());},
    onStatus:({ready,total,failed})=>{
      document.getElementById('asset-status').textContent=failed?'건물 '+failed+'구역 로드 실패 · R로 재시도':'주변 상세도 '+ready+' / '+total+' · 서울 25구 · 이동 중 불러오기';
    },
  });
  const first=checkpointDefs[0];runtime.city.update({x:first.x-360,z:first.z+36});
  // Only the nearest available tile gates first flight, never the whole city.
  const firstEntries=[...runtime.city.entries.values()].slice(0,3);
  if(firstEntries.length)await Promise.race(firstEntries.map(entry=>entry.promise));
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
  dom.districtGo.addEventListener('click',()=>goToDistrict(dom.districtSelect.value));
  window.addEventListener('pagehide', handlePageHide);

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
  if (!["intro","paused","complete"].includes(state.mode)) {
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

function handlePageHide(event) {
  pauseFlight();
  // A bfcache page keeps this same runtime on return. Do not terminate the
  // worker it will still need when the user visits another district.
  if (!event.persisted) runtime.cityWorker?.dispose();
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

  // Sample the final horizontal location. Clamping to the boundary after the
  // height test could move the camera into a higher neighbouring terrain cell.
  enforceBoundary(delta);

  const floor = safeFlightFloor(runtime.terrain,runtime.renderTerrain,state.position.x,state.position.z);

  if (state.position.y < floor) {
    state.position.y = floor;
    state.pitch = Math.max(state.pitch, 0.05);
    state.roll = THREE.MathUtils.damp(state.roll, 0, 5.4, delta);
    runtime.currentStatus = "안전 고도 보정 · 원본 지형/표시 지형/해발 0m 중 높은 면의 18m 위";
  }

  if (state.position.y > world.ceiling) {
    state.position.y = world.ceiling;
    state.pitch = Math.min(state.pitch, 0);
  }

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
  dom.targetName.textContent = current ? current.name : "서울 자유 비행";
  dom.progressValue.textContent = `${Math.min(state.checkpointIndex, checkpointDefs.length)} / ${checkpointDefs.length}`;
  dom.targetAltitude.textContent = current ? formatMetres(current.y) : "—";
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
  dom.resumeBtn.hidden = false;
  dom.resumeBtn.textContent = '서울 전역 자유 비행';
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

function goToDistrict(id) {
  const district=districtDefs.find(item=>item.id===id);
  if(!district||!runtime.scene)return;
  clearInputs();document.exitPointerLock?.();runtime.pointerLocked=false;
  const [x,z]=district.position;
  state.position.set(THREE.MathUtils.clamp(x,-world.width/2+world.boundaryPadding,world.width/2-world.boundaryPadding),
    Math.min(world.ceiling-80,safeFlightFloor(runtime.terrain,runtime.renderTerrain,x,z)+430),
    THREE.MathUtils.clamp(z,-world.depth/2+world.boundaryPadding,world.depth/2-world.boundaryPadding));
  state.yaw=yawToTarget(state.position,{x:0,z:0});state.pitch=-.16;state.roll=0;state.speed=74;
  state.mode='paused';runtime.currentStatus=district.name+' 상공 · 이동 중 건물 자료를 불러옵니다.';
  runtime.city?.update(state.position);updateCamera(0);startGame();
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
