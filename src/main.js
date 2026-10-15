// Batimento geométrico — app educacional (pt-BR)
// X = eixo (datum A), rotação em torno de X; relógio estático; erro na peça, exagerado só no visual.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const TOL = 0.05;
let mode = 'radial';
let speed = 1.0;
let amp = 0.05;
let angle = 0;
let running = false;
let oneRevolution = false;
let revStartAngle = 0;
let datumVisible = true;
let minR = Infinity, maxR = -Infinity;

// ponytail: amp real é 0,05 mm (invisível); VIS_EXAG exagera só no 3D para o cambaleio ficar visível
const VIS_EXAG = 3.0;
const PROBE_LEN = 1.45;

const $ = (s) => document.querySelector(s);
const els = {};
function cacheEls(){
  els.mount = $('#three-mount');
  els.drawing = $('#drawingContainer');
  els.modeTag = $('#modeTag');
  els.valAtual = $('#val-atual');
  els.valMin = $('#val-min');
  els.valMax = $('#val-max');
  els.valTir = $('#val-tir');
  els.veredito = $('#veredito');
  els.vereditoTexto = $('#veredito-texto');
  els.speed = $('#speedSlider');
  els.speedLabel = $('#speedLabel');
  els.amp = $('#ampSlider');
  els.ampLabel = $('#ampLabel');
  els.btnStart = $('#btn-start');
  els.btnUma = $('#btn-uma-volta');
  els.btnReset = $('#btn-reset');
  els.btnCamera = $('#btn-camera');
  els.chkDatum = $('#chk-datum');
  els.interpTitulo = $('#interp-titulo');
  els.interpTexto = $('#interp-texto');
  els.interpBullets = $('#interp-bullets');
  els.cardComparar = $('#card-comparar');
}

let scene, camera, renderer, controls, clock;
let shaftGroup, shaftMesh, shaftBasePositions, flangeMesh, markerStripe;
let datumGroup;
let indicatorGroup, needle, plunger, tip, dialGroup;
let arrowRadial, arrowAxial;
let highlightCyl, highlightFace;
const SHAFT_R = 1.2;
const SHAFT_L = 6.0;
const FLANGE_R = 1.9;
const FLANGE_T = 0.45;
const FLANGE_FACE_X = SHAFT_L/2 + FLANGE_T;
const RADIAL_CONTACT_X = -0.2;
const AXIAL_CONTACT_R = 1.15;

function initThree(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfbf8f1);
  const wrap = $('#canvasWrap');
  const w = wrap.clientWidth, h = wrap.clientHeight;
  camera = new THREE.PerspectiveCamera(36, w/h, 0.1, 100);
  camera.position.set(5.5, 3.2, 7.2);
  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w,h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  els.mount.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0.2, 0, 0);
  controls.minDistance = 3;
  controls.maxDistance = 14;
  controls.update();
  clock = new THREE.Clock();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xddd3c3, 1.05));
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(6,8,5);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024,1024);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-5,3,-6);
  scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30,30), new THREE.ShadowMaterial({ opacity:0.12 }));
  floor.rotation.x = -Math.PI/2;
  floor.position.y = -1.75;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(20, 20, 0xe8ddd0, 0xe8ddd0);
  grid.position.y = -1.749;
  scene.add(grid);
  buildShaft();
  buildDatum();
  buildIndicator();
  buildArrows();
  updateModeVisuals();
  placeIndicatorForMode();
  onResize();
  window.addEventListener('resize', onResize);
}

function buildShaft(){
  shaftGroup = new THREE.Group();
  // Cilindro único contínuo (sem emenda) — deformação suave aplicada por vértice
  const shaftGeo = new THREE.CylinderGeometry(SHAFT_R, SHAFT_R, SHAFT_L, 48, 32, false);
  shaftGeo.rotateZ(Math.PI/2);
  const shaftMat = new THREE.MeshStandardMaterial({ color:0xcfe0e2, metalness:0.45, roughness:0.42 });
  shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
  shaftMesh.castShadow = true;
  shaftMesh.receiveShadow = true;
  shaftBasePositions = shaftGeo.attributes.position.array.slice();
  shaftGroup.add(shaftMesh);

  markerStripe = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.06, 0.025),
    new THREE.MeshStandardMaterial({ color:0xc41e3a })
  );
  shaftGroup.add(markerStripe);

  const flangeGeo = new THREE.CylinderGeometry(FLANGE_R, FLANGE_R, FLANGE_T, 48);
  flangeGeo.rotateZ(Math.PI/2);
  const flangeMat = new THREE.MeshStandardMaterial({ color:0xd7b896, metalness:0.15, roughness:0.55 });
  flangeMesh = new THREE.Mesh(flangeGeo, flangeMat);
  flangeMesh.position.x = SHAFT_L/2 + FLANGE_T/2;
  flangeMesh.castShadow = true; flangeMesh.receiveShadow = true;
  shaftGroup.add(flangeMesh);

  const chamferGeo = new THREE.TorusGeometry(SHAFT_R, 0.06, 10, 32);
  chamferGeo.rotateY(Math.PI/2);
  const chamfer = new THREE.Mesh(chamferGeo, new THREE.MeshStandardMaterial({ color:0xb9c4c7, metalness:0.4, roughness:0.5 }));
  chamfer.position.x = -SHAFT_L/2 + 0.06;
  shaftGroup.add(chamfer);

  const cylHlGeo = new THREE.CylinderGeometry(SHAFT_R*1.015, SHAFT_R*1.015, SHAFT_L*0.62, 32, 1, true);
  cylHlGeo.rotateZ(Math.PI/2);
  highlightCyl = new THREE.Mesh(cylHlGeo, new THREE.MeshStandardMaterial({ color:0x1a5a8a, transparent:true, opacity:0.0, side:THREE.DoubleSide }));
  shaftGroup.add(highlightCyl);

  const faceHlGeo = new THREE.CircleGeometry(FLANGE_R*0.92, 32);
  faceHlGeo.rotateY(Math.PI/2);
  highlightFace = new THREE.Mesh(faceHlGeo, new THREE.MeshStandardMaterial({ color:0xc41e3a, transparent:true, opacity:0.0, side:THREE.DoubleSide }));
  highlightFace.position.x = FLANGE_FACE_X + 0.015;
  shaftGroup.add(highlightFace);

  const supMat = new THREE.MeshStandardMaterial({ color:0x2c2a25, roughness:0.9 });
  // ponytail: apoios em trechos redondos (fora da janela de deformação) — datum A limpo
  for(const x of [-2.1, 2.1]){
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 1.4), supMat);
    base.position.set(x, -1.35, 0);
    base.castShadow = true; base.receiveShadow = true;
    scene.add(base);
    const v = new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.02,0.35,24), supMat);
    v.rotation.z = Math.PI/2;
    v.position.set(x, -0.92, 0);
    v.castShadow = true;
    scene.add(v);
  }
  scene.add(shaftGroup);
  updateShaftGeometry();
}

function bowFactor(x){ return 1 + 0.45 * (x / (SHAFT_L/2)); }

function updateShaftGeometry(){
  if(!shaftMesh || !shaftBasePositions) return;
  // axial: só face, não excentricidade radial — item 1
  const eMid = mode === 'axial' ? 0 : amp * VIS_EXAG;
  const pos = shaftMesh.geometry.attributes.position.array;
  const base = shaftBasePositions;
  // janela entre apoios (apoios em ±2.1 ficam redondos, w≈0) — item 3
  for(let i=0;i<pos.length;i+=3){
    const x = base[i];
    const y0 = base[i+1];
    const ax = Math.abs(x);
    let w;
    if(ax < 1.2) w = 1;
    else if(ax < 1.8) w = Math.cos((ax - 1.2) / 0.6 * Math.PI * 0.5);
    else w = 0;
    // só deforma se é superfície lateral, não as tampas
    const isCap = Math.abs(Math.abs(x) - SHAFT_L/2) < 0.02;
    // bow (empeno) varia ao longo do eixo — item 2: total ≠ circular
    const bow = isCap ? 1 : bowFactor(x);
    pos[i+1] = isCap ? y0 : y0 + eMid * w * bow;
    // z inalterado
  }
  shaftMesh.geometry.attributes.position.needsUpdate = true;
  shaftMesh.geometry.computeVertexNormals();

  // listra acompanha a superfície deformada no centro
  if(markerStripe){
    markerStripe.position.y = SHAFT_R + eMid + 0.02;
  }
  if(highlightCyl){
    highlightCyl.position.y = eMid;
  }
  // flange só inclina no modo axial (erro axial), nos outros fica quadrado
  if(flangeMesh){
    if(mode === 'axial'){
      const tanaVis = (amp * VIS_EXAG * 0.85) / AXIAL_CONTACT_R;
      flangeMesh.rotation.z = Math.atan(tanaVis);
    } else {
      flangeMesh.rotation.z = 0;
    }
    if(highlightFace) highlightFace.rotation.z = flangeMesh.rotation.z;
  }
}

function buildDatum(){
  datumGroup = new THREE.Group();
  const len = SHAFT_L + 3.2;
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-len/2,0,0), new THREE.Vector3(len/2+0.8,0,0)]);
  const line = new THREE.Line(lineGeo, new THREE.LineDashedMaterial({ color:0xc41e3a, dashSize:0.18, gapSize:0.12 }));
  line.computeLineDistances();
  datumGroup.add(line);
  const coneGeo = new THREE.ConeGeometry(0.09, 0.22, 12);
  coneGeo.rotateZ(-Math.PI/2);
  const coneMat = new THREE.MeshStandardMaterial({ color:0xc41e3a });
  const c1 = new THREE.Mesh(coneGeo, coneMat); c1.position.set(-len/2,0,0);
  const c2 = new THREE.Mesh(coneGeo, coneMat); c2.position.set(len/2+0.8,0,0); c2.rotation.z = Math.PI;
  datumGroup.add(c1,c2);
  const spr = makeTextSprite('A — datum', '#c41e3a');
  spr.position.set(0, 0.55, 0);
  spr.scale.set(1.9,0.48,1);
  datumGroup.add(spr);
  scene.add(datumGroup);
}
function makeTextSprite(text, color){
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0,0,c.width,c.height);
  g.fillStyle = color;
  g.font = '700 56px system-ui, sans-serif';
  g.textAlign='center'; g.textBaseline='middle';
  g.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true }));
}

function buildIndicator(){
  indicatorGroup = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,1.45,12), new THREE.MeshStandardMaterial({ color:0x2c2a25 }));
  stem.position.set(0,-0.175,0);
  indicatorGroup.add(stem);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.18,32), new THREE.MeshStandardMaterial({ color:0x1a3a52, metalness:0.2, roughness:0.6 }));
  body.rotation.x = Math.PI/2;
  body.castShadow = true;
  indicatorGroup.add(body);
  dialGroup = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), new THREE.MeshStandardMaterial({ color:0xfffffb }));
  face.position.z = 0.10;
  dialGroup.add(face);
  for(let i=0;i<40;i++){
    const a = i/40 * Math.PI*2;
    const len = (i%10===0)?0.10:0.05;
    const w = (i%10===0)?0.02:0.012;
    const tick = new THREE.Mesh(new THREE.PlaneGeometry(w,len), new THREE.MeshBasicMaterial({ color:0x2c2a25, side:THREE.DoubleSide }));
    const r = 0.47;
    tick.position.set(Math.cos(a)*r, Math.sin(a)*r, 0.11);
    tick.rotation.z = a;
    dialGroup.add(tick);
  }
  const needleGeo = new THREE.BufferGeometry();
  needleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.42, 0.02, -0.04, 0, 0.02, 0.04, 0, 0.02]),3));
  needleGeo.setIndex([0,1,2]);
  needleGeo.computeVertexNormals();
  needle = new THREE.Mesh(needleGeo, new THREE.MeshStandardMaterial({ color:0xc41e3a }));
  needle.position.z = 0.12;
  dialGroup.add(needle);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.02,12), new THREE.MeshStandardMaterial({ color:0x2c2a25 }));
  pin.rotation.x = Math.PI/2;
  pin.position.z = 0.13;
  dialGroup.add(pin);
  indicatorGroup.add(dialGroup);
  plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.9,12), new THREE.MeshStandardMaterial({ color:0x6b7d7a }));
  plunger.position.y = -0.95;
  plunger.castShadow = true;
  indicatorGroup.add(plunger);
  tip = new THREE.Mesh(new THREE.SphereGeometry(0.09,16,12), new THREE.MeshStandardMaterial({ color:0xc41e3a }));
  tip.position.y = -PROBE_LEN + 0.09; // centro = fundo + raio: ponta encosta, não atravessa
  tip.castShadow = true;
  indicatorGroup.add(tip);
  scene.add(indicatorGroup);
}

function buildArrows(){
  arrowRadial = new THREE.ArrowHelper(new THREE.Vector3(0,-1,0), new THREE.Vector3(RADIAL_CONTACT_X, SHAFT_R+0.9, 0), 0.75, 0xc41e3a, 0.16, 0.11);
  scene.add(arrowRadial);
  arrowAxial = new THREE.ArrowHelper(new THREE.Vector3(-1,0,0), new THREE.Vector3(FLANGE_FACE_X+0.9, AXIAL_CONTACT_R, 0), 0.75, 0xc41e3a, 0.16, 0.11);
  scene.add(arrowAxial);
}
function placeIndicator(contact, dir){
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0), dir.clone().normalize());
  indicatorGroup.quaternion.copy(q);
  indicatorGroup.position.copy(contact).addScaledVector(dir.clone().normalize(), -PROBE_LEN);
}
function placeIndicatorForMode(){
  if(mode==='radial'){
    placeIndicator(new THREE.Vector3(RADIAL_CONTACT_X, SHAFT_R, 0), new THREE.Vector3(0,-1,0));
  } else if(mode==='axial'){
    placeIndicator(new THREE.Vector3(FLANGE_FACE_X, AXIAL_CONTACT_R, 0), new THREE.Vector3(-1,0,0));
  } else {
    placeIndicator(new THREE.Vector3(RADIAL_CONTACT_X, SHAFT_R, 0), new THREE.Vector3(0,-1,0));
  }
}

// ---------- desenho técnico ----------
function buildDrawing(){
  const el = els.drawing;
  const W = 760, H = 360;
  const frames = [
    { id:'radial', kind:'circ',  label:'Superfície lateral · cilíndrica', toler:'0,05', datum:'A', x: 18 },
    { id:'axial',  kind:'circ',  label:'Face do flange',                toler:'0,05', datum:'A', x: 272 },
    { id:'total',  kind:'total', label:'Superfície lateral inteira',    toler:'0,05', datum:'A', x: 526 },
  ];
  const frameSvg = frames.map(f => `
    <g class="dwg-frame ${mode===f.id?'is-selected':''}" data-mode="${f.id}" transform="translate(${f.x}, 236)">
      <rect x="0" y="0" width="170" height="42" rx="6" stroke="#2c2a25" stroke-width="1.2"/>
      <line x1="44" y1="0" x2="44" y2="42" stroke="#2c2a25" stroke-width="1.2"/>
      <line x1="108" y1="0" x2="108" y2="42" stroke="#2c2a25" stroke-width="1.2"/>
      ${f.kind==='circ' ? `<use href="#sym-circ" x="8" y="7"/>` : `<use href="#sym-total" x="5" y="7"/>`}
      <text x="76" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#c41e3a">${f.toler}</text>
      <text x="139" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#2c2a25">${f.datum}</text>
    </g>
    <text x="${f.x+85}" y="294" text-anchor="middle" font-size="8.2" fill="#4a4641">${f.label}</text>
    <line class="dwg-leader" x1="${f.x+85}" y1="278" x2="${f.id==='axial' ? 560 : (f.id==='radial' ? 220 : 260)}" y2="${f.id==='axial' ? 168 : 122}" />
  `).join('');
  el.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Desenho técnico do eixo com flange e cotas">
    <rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" rx="10" fill="#fbf8f1" stroke="#ddd3c3"/>
    <g font-family="system-ui,sans-serif">
      <text x="14" y="20" font-size="10" font-weight="700" fill="#6b6760" letter-spacing="0.06em">VISTA LONGITUDINAL · ESCALA ILUSTRATIVA</text>
      <text x="${W-14}" y="20" font-size="9" fill="#6b6760" text-anchor="end">mm · datum A</text>
    </g>
    <rect x="110" y="86" width="310" height="56" rx="1.2" fill="#eef3f4" stroke="#2c2a25" stroke-width="1.4"/>
    <rect x="420" y="68" width="28" height="92" rx="1.2" fill="#f3e0c0" stroke="#2c2a25" stroke-width="1.4"/>
    <line x1="110" y1="86" x2="118" y2="94" stroke="#2c2a25" stroke-width="1"/>
    <line x1="110" y1="142" x2="118" y2="134" stroke="#2c2a25" stroke-width="1"/>
    <line x1="92" y1="114" x2="468" y2="114" class="dwg-center"/>
    <text x="464" y="110" font-size="10" font-weight="800" fill="#c41e3a">A</text>
    <line x1="178" y1="142" x2="178" y2="158" stroke="#2c2a25" stroke-width="0.9"/>
    <polygon points="168,158 188,158 178,142" fill="#c41e3a" stroke="#7a0f1f" stroke-width="0.8"/>
    <rect x="162" y="166" width="32" height="14" rx="2" fill="#fff" stroke="#2c2a25" stroke-width="1"/><text x="178" y="176.5" text-anchor="middle" font-size="9" font-weight="700" fill="#2c2a25">A</text>
    <g stroke="#2c2a25" stroke-width="0.9" fill="none">
      <line x1="110" y1="62" x2="110" y2="52"/><line x1="420" y1="62" x2="420" y2="52"/>
      <line x1="110" y1="56" x2="420" y2="56" marker-start="url(#arr)" marker-end="url(#arr)"/>
    </g>
    <text x="265" y="50" text-anchor="middle" font-size="9" fill="#2c2a25">310 (comprimento ilustrativo)</text>
    <g stroke="#2c2a25" stroke-width="0.9" fill="none">
      <line x1="96" y1="86" x2="86" y2="86"/><line x1="96" y1="142" x2="86" y2="142"/>
      <line x1="90" y1="86" x2="90" y2="142" marker-start="url(#arr)" marker-end="url(#arr)"/>
    </g>
    <text x="72" y="118" text-anchor="middle" font-size="8" fill="#2c2a25" transform="rotate(-90 72 118)">Ø — cilíndrico</text>
    <g stroke="#2c2a25" stroke-width="0.9" fill="none">
      <line x1="420" y1="60" x2="448" y2="60" marker-start="url(#arr)" marker-end="url(#arr)"/>
    </g>
    <text x="434" y="56" text-anchor="middle" font-size="8" fill="#2c2a25">flange</text>
    <g transform="translate(620,114)">
      <circle r="42" fill="#eef3f4" stroke="#2c2a25" stroke-width="1.2"/>
      <circle r="18" fill="none" stroke="#6b6760" stroke-width="0.8" stroke-dasharray="4 4"/>
      <line x1="-48" y1="0" x2="48" y2="0" class="dwg-center"/>
      <line x1="0" y1="-48" x2="0" y2="48" class="dwg-center"/>
      <text x="0" y="62" text-anchor="middle" font-size="8" fill="#6b6760">vista de extremidade</text>
    </g>
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2c2a25"/>
      </marker>
    </defs>
    ${frameSvg}
  </svg>`;
  el.querySelectorAll('.dwg-frame').forEach(g=> g.addEventListener('click', ()=> setMode(g.dataset.mode)));
}

let traverse = 0;
let traverseDir = 1;
function windowAt(x){
  const ax = Math.abs(x);
  if(ax < 1.2) return 1;
  if(ax < 1.8) return Math.cos((ax - 1.2) / 0.6 * Math.PI * 0.5);
  return 0;
}
function computeReading(theta){
  if(mode==='radial'){
    const x = RADIAL_CONTACT_X;
    return amp * Math.cos(theta) * bowFactor(x) * windowAt(x);
  }
  if(mode==='axial') return amp * 0.85 * Math.cos(theta);
  const x = traverse * (SHAFT_L/2 - 1.8);
  // bow total: excentricidade varia ao longo — física correta para total (item 2)
  return amp * Math.cos(theta) * bowFactor(x) * windowAt(x);
}
function updateReadout(theta, reading){
  if(reading < minR) minR = reading;
  if(reading > maxR) maxR = reading;
  const tir = (isFinite(minR) && isFinite(maxR)) ? (maxR - minR) : 0;
  const scale = (amp>1e-9) ? (reading / (amp*1.2)) : 0;
  needle.rotation.z = -THREE.MathUtils.clamp(scale, -1, 1) * (Math.PI*0.75);
  const eMid = mode === 'axial' ? 0 : amp * VIS_EXAG;
  // ponytail: haste segue exatamente a superfície — ponta sempre encostada, sem atravessar (item 5: inclui w e bow)
  let effectiveDelta;
  if(mode === 'axial'){
    effectiveDelta = amp * VIS_EXAG * 0.85 * Math.cos(theta);
  } else if(mode === 'total'){
    const x = traverse * (SHAFT_L/2 - 1.8);
    effectiveDelta = amp * VIS_EXAG * Math.cos(theta) * bowFactor(x) * windowAt(x);
  } else {
    const x = RADIAL_CONTACT_X;
    effectiveDelta = amp * VIS_EXAG * Math.cos(theta) * bowFactor(x) * windowAt(x);
  }
  tip.position.y = -PROBE_LEN + 0.09 + effectiveDelta;
  plunger.position.y = -0.95 + effectiveDelta;
  if(mode==='total'){
    traverse += 0.003 * speed * traverseDir;
    if(traverse > 1) { traverse = 1; traverseDir = -1; }
    if(traverse < -1){ traverse = -1; traverseDir = 1; }
    const x = traverse * (SHAFT_L/2 - 1.8);
    placeIndicator(new THREE.Vector3(x, SHAFT_R, 0), new THREE.Vector3(0,-1,0));
    // reaplica no novo frame (usa o x atualizado no próximo tick)
    const nextDelta = amp * VIS_EXAG * Math.cos(theta) * bowFactor(x) * windowAt(x);
    tip.position.y = -PROBE_LEN + 0.09 + nextDelta;
    plunger.position.y = -0.95 + nextDelta;
  }
  const fmt = (v)=> (Math.abs(v)<0.0005? '0,000' : v.toFixed(3).replace('.',','));
  els.valAtual.textContent = `${fmt(reading)} mm`;
  els.valMin.textContent = isFinite(minR) ? `${fmt(minR)} mm` : '—';
  els.valMax.textContent = isFinite(maxR) ? `${fmt(maxR)} mm` : '—';
  els.valTir.textContent = isFinite(minR) ? `${fmt(tir)} mm` : '—';
  const pass = tir <= TOL + 1e-9;
  const hasData = isFinite(minR);
  els.veredito.className = 'veredito ' + (hasData ? (pass ? 'veredito--ok' : 'veredito--fail') : '');
  if(!hasData) els.vereditoTexto.textContent = 'Aguardando medição — gire o eixo para coletar leituras.';
  else if(pass) els.vereditoTexto.textContent = `Dentro da tolerância — TIR ${fmt(tir)} mm ≤ ${fmt(TOL)} mm.`;
  else els.vereditoTexto.textContent = `Fora da tolerância — TIR ${fmt(tir)} mm > ${fmt(TOL)} mm.`;
}
function resetStats(){
  minR = Infinity; maxR = -Infinity;
  traverse = -1; traverseDir = 1;
  els.veredito.className = 'veredito';
  els.vereditoTexto.textContent = 'Aguardando medição — gire o eixo para coletar leituras.';
  els.valAtual.textContent = '0,000 mm';
  els.valMin.textContent = '—';
  els.valMax.textContent = '—';
  els.valTir.textContent = '—';
  needle.rotation.z = 0;
  tip.position.y = -PROBE_LEN + 0.09;
  plunger.position.y = -0.95;
  if(mode==='total') placeIndicator(new THREE.Vector3(-SHAFT_L/2+1.8, SHAFT_R, 0), new THREE.Vector3(0,-1,0));
}

const MODE_META = {
  radial: {
    tag:'Batimento circular radial',
    titulo:'Batimento circular radial',
    texto:'Verifica quanto a indicação varia em uma seção circular da superfície lateral enquanto a peça gira em torno do datum.',
    bullets:[
      '<strong>Superfície controlada:</strong> lateral cilíndrica (seção circular).',
      '<strong>Direção de medição:</strong> radial — relógio estático, peça gira; ponta no topo; seta vertical.',
      '<strong>O que revela:</strong> excentricidade, ovalização ou irregularidades da lateral.',
    ]
  },
  axial: {
    tag:'Batimento circular axial',
    titulo:'Batimento circular axial',
    texto:'Verifica quanto a indicação varia ao longo de uma trajetória circular em uma face perpendicular ao eixo de rotação.',
    bullets:[
      '<strong>Superfície controlada:</strong> face frontal do flange.',
      '<strong>Direção de medição:</strong> axial — relógio estático na face; seta ao longo do eixo.',
      '<strong>O que revela:</strong> inclinação da face, empeno ou falta de perpendicularidade.',
    ]
  },
  total: {
    tag:'Batimento total radial',
    titulo:'Batimento total radial',
    texto:'Verifica a variação da superfície cilíndrica inteira, considerando a rotação da peça e o deslocamento do instrumento ao longo da superfície.',
    bullets:[
      '<strong>Superfície controlada:</strong> lateral cilíndrica inteira (toda a extensão).',
      '<strong>Direção:</strong> radial, mas o relógio translada ao longo do eixo enquanto a peça gira.',
      '<strong>Diferença:</strong> circular avalia uma seção; total avalia a superfície inteira (não são sinônimos).',
    ]
  },
};
function setMode(m){
  mode = m;
  updateModeVisuals();
  updateShaftGeometry();
  placeIndicatorForMode();
  resetStats();
  updateReadout(angle, computeReading(angle));
  buildDrawing();
  syncPills();
}
function updateModeVisuals(){
  const meta = MODE_META[mode];
  els.modeTag.textContent = meta.tag;
  els.interpTitulo.textContent = meta.titulo;
  els.interpTexto.textContent = meta.texto;
  els.interpBullets.innerHTML = meta.bullets.map(b=>`<li>${b}</li>`).join('');
  els.cardComparar.hidden = mode!=='total';
  highlightCyl.material.opacity = mode==='radial' ? 0.18 : (mode==='total'? 0.13 : 0.0);
  highlightFace.material.opacity = mode==='axial' ? 0.22 : 0.0;
  arrowRadial.visible = mode==='radial' || mode==='total';
  arrowAxial.visible = mode==='axial';
  if(datumGroup) datumGroup.visible = datumVisible;
}
function syncPills(){ document.querySelectorAll('.pill').forEach(b=> b.classList.toggle('active', b.dataset.mode===mode)); }

function tick(){
  requestAnimationFrame(tick);
  const dt = clock.getDelta();
  if(running){
    const dAngle = dt * 1.35 * speed;
    angle += dAngle;
    shaftGroup.rotation.x = angle;
    const reading = computeReading(angle);
    updateReadout(angle, reading);
    if(oneRevolution && angle - revStartAngle >= Math.PI*2){
      running = false;
      oneRevolution = false;
      els.btnStart.textContent = '▶ Iniciar';
      els.btnUma.disabled = false;
    }
  }
  controls.update();
  renderer.render(scene, camera);
}
function onResize(){
  const wrap = document.getElementById('canvasWrap');
  if(!wrap || !renderer || !camera) return;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h);
}
function wire(){
  cacheEls();
  document.querySelectorAll('.pill').forEach(b=> b.addEventListener('click', ()=> setMode(b.dataset.mode)));
  $('#btn-como-ler').addEventListener('click', ()=> $('#dlg-ler').showModal());
  $('#btn-comparar').addEventListener('click', ()=>{
    const willShow = els.cardComparar.hidden;
    els.cardComparar.hidden = !willShow;
    if(willShow) els.cardComparar.scrollIntoView({ behavior:'smooth', block:'nearest' });
  });
  els.btnStart.addEventListener('click', ()=>{
    running = !running;
    els.btnStart.textContent = running ? '⏸ Pausar' : '▶ Iniciar';
    if(running && !isFinite(minR)) updateReadout(angle, computeReading(angle));
  });
  els.btnUma.addEventListener('click', ()=>{
    if(running) return;
    running = true;
    oneRevolution = true;
    revStartAngle = angle;
    els.btnStart.textContent = '⏸ Pausar';
    els.btnUma.disabled = true;
  });
  els.btnReset.addEventListener('click', ()=>{
    running = false;
    oneRevolution = false;
    angle = 0;
    shaftGroup.rotation.x = 0;
    resetStats();
    updateReadout(angle, computeReading(angle));
    els.btnStart.textContent = '▶ Iniciar';
    els.btnUma.disabled = false;
  });
  els.speed.addEventListener('input', ()=>{
    speed = parseFloat(els.speed.value);
    els.speedLabel.textContent = speed.toFixed(1).replace('.',',') + '×';
  });
  els.amp.addEventListener('input', ()=>{
    amp = parseFloat(els.amp.value);
    els.ampLabel.textContent = amp.toFixed(2).replace('.',',') + ' mm';
    updateShaftGeometry();
    if(!running) updateReadout(angle, computeReading(angle));
  });
  els.btnCamera.addEventListener('click', ()=>{
    camera.position.set(5.5,3.2,7.2);
    controls.target.set(0.2,0,0);
    controls.update();
  });
  els.chkDatum.addEventListener('change', ()=>{
    datumVisible = els.chkDatum.checked;
    if(datumGroup) datumGroup.visible = datumVisible;
    arrowRadial.visible = datumVisible && (mode==='radial'||mode==='total');
    arrowAxial.visible = datumVisible && mode==='axial';
    const tag = document.getElementById('datumTag');
    if(tag) tag.style.opacity = datumVisible ? '1' : '0.35';
  });
  els.speedLabel.textContent = speed.toFixed(1).replace('.',',')+'×';
  els.ampLabel.textContent = amp.toFixed(2).replace('.',',')+' mm';
}
wire();
initThree();
buildDrawing();
syncPills();
resetStats();
updateModeVisuals();
updateShaftGeometry();
placeIndicatorForMode();
updateReadout(angle, computeReading(angle));
tick();
