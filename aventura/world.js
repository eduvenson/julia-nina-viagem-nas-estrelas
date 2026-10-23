import * as THREE from './vendor/three.module.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { DOGS, FISH_PATH, FISH_GAPS } from './core.js';
import { girlPose, dogPose } from './motion.js';

const materials = new Map();
const geometries = new Map();
const boxGeo = () => geometry('box', () => new RoundedBoxGeometry(1, 1, 1, 1, .08));
function geometry(key, make) { if (!geometries.has(key)) geometries.set(key, make()); return geometries.get(key); }
function mat(color, glow = false, transparent = false) {
  const key = `${color}-${glow}-${transparent}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .75,
    emissive: glow ? color : '#000000', emissiveIntensity: glow ? .65 : 0,
    transparent, opacity: transparent ? .32 : 1 }));
  return materials.get(key);
}
function mesh(parent, geo, color, x, y, z, sx = 1, sy = 1, sz = 1, glow = false) {
  const m = new THREE.Mesh(geo, mat(color, glow)); m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  m.castShadow = !glow; m.receiveShadow = true; parent.add(m); return m;
}
export function box(parent, color, x, y, z, sx = 1, sy = 1, sz = 1, glow = false) {
  return mesh(parent, boxGeo(), color, x, y, z, sx, sy, sz, glow);
}
function ball(parent, color, x, y, z, r = 1, glow = false) {
  return mesh(parent, geometry('sphere', () => new THREE.SphereGeometry(1, 16, 12)), color, x, y, z, r, r, r, glow);
}
function cylinder(parent, color, x, y, z, r, height, top = r, sides = 12) {
  const geo = geometry(`cyl-${top / r}-${sides}`, () => new THREE.CylinderGeometry(top / r, 1, 1, sides));
  return mesh(parent, geo, color, x, y, z, r, height, r);
}
function group(parent, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }
function ellipsoid(parent, color, x, y, z, sx, sy, sz) {
  return mesh(parent, geometry('sphere', () => new THREE.SphereGeometry(1, 20, 14)), color, x, y, z, sx, sy, sz);
}
function capsule(parent, color, x, y, z, radius, length) {
  return mesh(parent, geometry(`capsule-${length / radius}`, () => new THREE.CapsuleGeometry(1, length / radius, 5, 10)), color, x, y, z, radius, radius, radius);
}
function batchStatic(parent, excluded = []) {
  parent.updateMatrixWorld(true);
  const batches = new Map(), inverse = parent.matrixWorld.clone().invert();
  parent.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    for (let node = o; node && node !== parent; node = node.parent) if (excluded.includes(node)) return;
    const key = `${o.geometry.uuid}-${o.material.uuid}-${o.castShadow}`;
    if (!batches.has(key)) batches.set(key, []); batches.get(key).push(o);
  });
  for (const objects of batches.values()) {
    if (objects.length < 2) continue;
    const first = objects[0], instance = new THREE.InstancedMesh(first.geometry, first.material, objects.length);
    instance.castShadow = first.castShadow; instance.receiveShadow = true;
    objects.forEach((o, i) => instance.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld)));
    parent.add(instance); objects.forEach(o => o.removeFromParent());
  }
}
function textSprite(parent, text, x, y, z, color = '#fff6dc', width = 3) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 112;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16333b'; ctx.beginPath(); ctx.roundRect(3, 3, 506, 106, 38); ctx.fill();
  ctx.font = 'bold 56px Arial'; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 59);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.SpriteMaterial({ map: texture, depthWrite: false });
  const sprite = new THREE.Sprite(m); sprite.position.set(x, y, z); sprite.scale.set(width, width * 112 / 512, 1); parent.add(sprite); return sprite;
}

function smile(parent, color, x, y, z, scale = 1) {
  const geo = geometry('smile', () => new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-.18, 0, 0), new THREE.Vector3(0, -.16, .035), new THREE.Vector3(.18, 0, 0)), 12, .023, 5, false));
  return mesh(parent, geo, color, x, y, z, scale, scale, scale);
}
function jerseyMaterial(julia) {
  const key = julia ? 'jersey-brazil' : 'jersey-argentina';
  if (!materials.has(key)) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d'); ctx.fillStyle = julia ? '#f3d04f' : '#fff8ef'; ctx.fillRect(0, 0, 256, 256);
    if (!julia) { ctx.fillStyle = '#7bbfe2'; for (let i = -1; i < 8; i++) ctx.fillRect(i * 64 - 16, 0, 32, 256); }
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    materials.set(key, new THREE.MeshStandardMaterial({ map: texture, roughness: .9 }));
  }
  return materials.get(key);
}
function girl(parent, name, skates = false, helmet = false) {
  const julia = name === 'julia', g = group(parent);
  const skin = julia ? '#f0b997' : '#e5b591', hair = julia ? '#805037' : '#29232a';
  const shirt = julia ? '#f2d154' : '#fff7eb', accent = julia ? '#33865e' : '#7dbbdf';
  const torso = geometry('torso', () => new THREE.LatheGeometry([
    new THREE.Vector2(.32, 0), new THREE.Vector2(.47, .1), new THREE.Vector2(.49, .64),
    new THREE.Vector2(.4, .9), new THREE.Vector2(.23, 1)], 18));
  const uniform = mesh(g, torso, shirt, 0, 1.1, 0, 1, 1.02, .8); uniform.material = jerseyMaterial(julia);
  const collar = mesh(g, geometry('collar', () => new THREE.TorusGeometry(.24, .05, 6, 16)), accent, 0, 2.1, 0); collar.rotation.x = Math.PI / 2;
  ellipsoid(g, accent, 0, 1.13, 0, .45, .12, .35);
  capsule(g, skin, 0, 2.2, 0, .18, .18);
  const head = group(g, 0, 2.68, .01);
  ellipsoid(head, skin, 0, 0, 0, .59, .64, .52);
  for (const side of [-1, 1]) ellipsoid(head, skin, side * .58, -.03, 0, .09, .14, .1);
  // Cabelo acompanha a forma da cabeça, com franja lateral e mechas separadas.
  mesh(head, geometry('haircap', () => new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * .53)),
    hair, 0, .16, -.04, .63, .53, .56);
  ellipsoid(head, hair, -.3, .35, .32, .35, .22, .22).rotation.z = -.35;
  ellipsoid(head, hair, .37, .28, .24, .24, .28, .23).rotation.z = .4;
  if (julia) {
    const pony = group(head, .05, .3, -.54); pony.rotation.x = -.3;
    head.userData.pony = pony;
    for (let i = 0; i < 3; i++) ellipsoid(pony, i % 2 ? '#996743' : hair, (i - 1) * .1, -.27 - i * .16, -.05, .22 - i * .025, .43, .22);
    ellipsoid(head, '#f4accb', -.16, .57, -.33, .2, .12, .11).rotation.z = -.3;
    ellipsoid(head, '#f4accb', .16, .57, -.33, .2, .12, .11).rotation.z = .3;
    ball(head, '#fff0d7', 0, .57, -.28, .09);
  } else {
    ellipsoid(head, hair, 0, -.34, -.42, .53, .68, .21);
    for (const side of [-1, 1]) {
      ellipsoid(head, hair, side * .47, -.3, -.09, .17, .68, .2).rotation.z = side * .1;
      ellipsoid(head, '#3c3034', side * .5, -.55, -.1, .1, .4, .12).rotation.z = side * .12;
    }
  }
  const eyelids = [];
  for (const side of [-1, 1]) {
    const x = side * .23;
    ellipsoid(head, '#fff9ed', x, .04, .473, .16, .17, .055);
    ellipsoid(head, '#553d35', x + side * .012, .03, .519, .092, .117, .028);
    ellipsoid(head, '#201e28', x + side * .012, .03, .543, .055, .083, .016);
    ball(head, '#ffffff', x - .024, .075, .56, .025);
    ellipsoid(head, hair, x, .25, .46, .13, .025, .035).rotation.z = side * -.1;
    ellipsoid(head, julia ? '#eaa492' : '#dba493', side * .36, -.15, .43, .095, .045, .025);
    const lid = group(head, x, .04, .58); ellipsoid(lid, skin, 0, 0, 0, .17, .19, .025);
    ellipsoid(lid, hair, 0, -.015, .028, .13, .012, .01); lid.visible = false; eyelids.push(lid);
  }
  ellipsoid(head, skin, 0, -.1, .53, .085, .09, .07);
  smile(head, '#954f52', 0, -.23, .493, .8);
  const badge = ellipsoid(g, julia ? '#287f58' : '#e8bf5b', -.2, 1.82, .345, .09, .11, .025);
  ball(g, julia ? '#5786ad' : '#fff6df', -.2, 1.82, .375, .043);
  const limbs = [], elbows = [], knees = [];
  for (const side of [-1, 1]) {
    const arm = group(g, side * .52, 2, 0); arm.rotation.z = side * .1;
    capsule(arm, shirt, 0, -.17, 0, .19, .23);
    capsule(arm, accent, 0, -.34, 0, .194, .025);
    const elbow = group(arm, 0, -.43, 0); capsule(elbow, skin, 0, -.12, .015, .135, .18);
    ellipsoid(elbow, skin, 0, -.36, .02, .15, .18, .14); elbows.push(elbow);
    const leg = group(g, side * .24, 1.13, 0);
    capsule(leg, julia ? '#426d92' : '#658ba8', 0, -.2, 0, .18, .2);
    const knee = group(leg, 0, -.5, 0); capsule(knee, julia ? '#426d92' : '#658ba8', 0, -.12, 0, .17, .19); knees.push(knee);
    ellipsoid(knee, julia ? '#eb8cb4' : '#fff4df', 0, -.44, .12, .22, .17, .36);
    if (skates) for (const z of [-.12, .31]) for (const x of [-.23, .23]) {
      const wheel = cylinder(knee, '#38465b', x, -.58, z, .12, .09); wheel.rotation.z = Math.PI / 2;
    }
    if (helmet) { ellipsoid(arm, accent, 0, -.55, .12, .16, .13, .07); ellipsoid(leg, accent, 0, -.4, .16, .18, .15, .08); }
    limbs.push(arm, leg);
  }
  if (helmet) mesh(head, geometry('helmet', () => new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
    julia ? '#e875a3' : '#5ebdc7', 0, .34, -.02, .68, .47, .61);
  batchStatic(head, [head.userData.pony, ...eyelids]);
  return { root: g, limbs, head, name, elbows, knees, eyelids };
}
function dog(parent, info, index) {
  const g = group(parent), c = info.coat, muzzle = info.name === 'Bidu' ? '#423a33' : '#f6dfba';
  const body = ellipsoid(g, c, 0, .63, -.04, .37, .4, info.name === 'Bidu' ? .92 : .7);
  const head = group(g, 0, 1.05, .46), ears = [], legs = [];
  ellipsoid(head, c, 0, 0, 0, .38, .4, .4);
  ellipsoid(head, muzzle, 0, -.15, .35, .27, .2, .22);
  ellipsoid(head, '#282a33', 0, -.05, .53, .13, .09, .08);
  for (const side of [-1, 1]) {
    ellipsoid(head, '#fdf1d8', side * .19, .1, .32, .12, .12, .04);
    ball(head, '#27272e', side * .19, .1, .357, .077); ball(head, '#ffffff', side * .19 - .019, .13, .42, .021);
    const ear = group(head, side * .37, .18, -.07); ear.rotation.z = side * -.2;
    ellipsoid(ear, c, 0, -.2, 0, .14, .4, .17); ears.push(ear);
    for (const z of [-.43, .4]) {
      const leg = group(g, side * .22, .43, z); capsule(leg, c, 0, -.17, 0, .09, .28);
      ellipsoid(leg, muzzle, 0, -.35, .04, .12, .09, .16); legs.push(leg);
    }
  }
  cylinder(g, info.owner === 'julia' ? '#f17da8' : '#40b5b4', 0, .84, .43, .32, .1);
  ball(g, '#f4d17e', 0, .8, .78, .07);
  const tail = group(g, 0, .82, -.69); capsule(tail, c, 0, .12, -.1, .085, .35).rotation.x = -.8;
  const label = textSprite(g, info.name, 0, 1.85, 0, info.owner === 'julia' ? '#ffb9d5' : '#97f0e2', 1.8);
  smile(head, '#634a40', 0, -.22, .52, .4);
  batchStatic(head, ears); batchStatic(g, [tail, head, body, ...legs]);
  return { root: g, tail, label, info, head, ears, legs, body, activity: 'watch' };
}
function flightShip(parent) {
  const g = group(parent);
  ellipsoid(g, '#f5efdf', 0, 1.15, 0, 1.65, .82, 2.5);
  ellipsoid(g, '#f7ebda', 0, 1.13, -2.05, .85, .48, 1.3);
  ellipsoid(g, '#54b4bd', 0, 1.4, -2.65, .35, .16, .5);
  for (const side of [-1, 1]) {
    const fin = box(g, side < 0 ? '#ec78a5' : '#54b6b9', side * 1.7, .9, .3, 1.5, .18, 2.3); fin.rotation.y = side * .35;
    const engine = cylinder(g, '#6b8095', side * 1.1, .85, 2.05, .43, 1.1); engine.rotation.x = Math.PI / 2;
    const flame = ellipsoid(g, '#ffd28b', side * 1.1, .85, 3, .24, .24, .8); flame.material = mat('#ffcb7a', true);
    box(g, side < 0 ? '#f6a6c5' : '#8ce5e0', side * 2.25, .98, -.2, .15, .12, 1.1, true);
    ellipsoid(g, '#61798b', side * .64, 1.9, -.2, .34, .55, .28);
  }
  const canopy = mesh(g, geometry('canopy', () => new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2)), '#a8e2e5', 0, 1.9, -.15, 1.35, 1.6, 1.3);
  canopy.material = mat('#a8e2e5', false, true); canopy.castShadow = false;
  const console = box(g, '#49677c', 0, 1.75, -.95, 1.8, .25, .55); console.rotation.x = .2;
  for (const x of [-.6, -.3, 0, .3, .6]) ball(g, '#f8d995', x, 1.94, -1, .055, true);
  return g;
}

function rocket(parent, x, z, scale = 1) {
  const g = group(parent, x, 0, z); g.scale.setScalar(scale);
  cylinder(g, '#f3f2e8', 0, 3.3, 0, 1.7, 5);
  cylinder(g, '#ec5c96', 0, 6.65, 0, 1.7, 1.8, 0);
  cylinder(g, '#23969d', 0, 1, 0, 1.85, .6);
  const window = cylinder(g, '#60c8df', 0, 4.5, 1.55, .9, .22); window.rotation.x = Math.PI / 2;
  const rim = mesh(g, geometry('torus', () => new THREE.TorusGeometry(1, .13, 8, 20)), '#e3ad60', 0, 4.5, 1.7, 1, 1, 1); rim.castShadow = false;
  for (const side of [-1, 1]) {
    const fin = box(g, side === -1 ? '#ed619a' : '#2aa5ae', side * 1.65, 1.3, 0, .55, 2.5, 1.8); fin.rotation.z = side * -.25;
  }
  const flame = cylinder(g, '#ffd582', 0, -.5, 0, .7, 2, 1.4); flame.material = mat('#ffcb6d', true);
  g.userData.flame = flame; return g;
}
function tree(parent, x, z, scale = 1, pine = false) {
  const g = group(parent, x, 0, z); g.scale.setScalar(scale);
  cylinder(g, '#92704c', 0, 1.5, 0, .32, 3);
  if (pine) {
    for (let i = 0; i < 3; i++) cylinder(g, ['#387d64', '#408e64', '#53a371'][i], 0, 2 + i * .85, 0, 1.7 - i * .35, 2, 0, 6);
  } else {
    for (const [dx, dy, dz, r, c] of [[0, 4, 0, 1.9, '#438966'], [-1.1, 3.3, .2, 1.3, '#66a66b'], [1, 3.6, .3, 1.4, '#80b876']]) {
      ellipsoid(g, c, dx, dy, dz, r, r * 1.05, r * .9);
    }
  }
}
function palm(parent, x, z) {
  const g = group(parent, x, 0, z); cylinder(g, '#aa7950', 0, 3.1, 0, .25, 6.2, .18);
  for (let i = 0; i < 7; i++) {
    const leaf = group(g, 0, 6.3, 0); leaf.rotation.y = i * Math.PI * 2 / 7;
    const b = ellipsoid(leaf, '#44866a', 0, -.2, 1.2, .4, .12, 1.9); b.rotation.x = .25;
  }
}
function house(parent, x, z, space = false) {
  const g = group(parent, x, 0, z);
  box(g, space ? '#e8dbc3' : '#f6e4bd', 0, 2, 0, 7, 4, 5);
  const roof = cylinder(g, space ? '#8e779f' : '#c4745b', 0, 5.1, 0, 5.1, 2.5, 0, 4); roof.rotation.y = Math.PI / 4;
  box(g, '#27999f', 0, 1.4, 2.56, 1.45, 2.8, .15);
  ball(g, '#f7c45a', .45, 1.5, 2.68, .1, true);
  for (const dx of [-2.25, 2.25]) {
    box(g, '#8b633f', dx, 2.1, 2.6, 1.6, 1.6, .15); box(g, '#ffe2a4', dx, 2.1, 2.7, 1.3, 1.3, .05, true);
    box(g, '#8b633f', dx, 2.1, 2.76, .09, 1.4, .04);
  }
  box(g, '#ad8060', 0, .12, 3.4, 8.8, .24, 2);
  return g;
}
function star(parent, x, y, z, color = '#eeb541') {
  const points = [];
  for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? .38 : .85; points.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r)); }
  const geo = geometry('star', () => new THREE.ExtrudeGeometry(new THREE.Shape(points), { depth: .22, bevelEnabled: true, bevelSize: .07, bevelThickness: .05, bevelSegments: 1, steps: 1 }));
  return mesh(parent, geo, color, x, y, z, 1, 1, 1, true);
}
function saucer(parent, x, z) {
  const g = group(parent, x, 2.6, z);
  const disc = ball(g, '#9c88ca', 0, 0, 0, 1.3); disc.scale.y = .27;
  ball(g, '#90d76d', 0, .45, 0, .6);
  for (const side of [-1, 1]) { ball(g, '#fffbe7', side * .2, .55, .48, .18); ball(g, '#28363a', side * .2, .55, .62, .08); }
  const ring = mesh(g, geometry('torus', () => new THREE.TorusGeometry(1, .13, 8, 20)), '#e4fa94', 0, .08, 0, 1.3, 1.3, 1.3, true); ring.rotation.x = Math.PI / 2;
  return g;
}
function zombie(parent, x, z, i) {
  const g = group(parent, x, 0, z), colors = ['#9371ad', '#e5994c', '#548894'];
  const limbs = [];
  ellipsoid(g, colors[i % 3], 0, 1.28, 0, .52, .65, .36);
  const head = group(g, 0, 2.2, 0); const skin = ellipsoid(head, '#a7c382', 0, 0, 0, .53, .58, .45);
  for (const side of [-1, 1]) {
    ellipsoid(head, '#fff3ce', side * .2, .1, .41, .15, .16, .04); ball(head, '#344e42', side * .2, .1, .45, .07);
    const arm = group(g, side * .57, 1.7, 0); capsule(arm, '#a7c382', 0, -.22, .14, .15, .5); limbs.push(arm);
    const leg = group(g, side * .25, .9, 0); capsule(leg, '#4e5a70', 0, -.32, 0, .17, .38);
    ellipsoid(leg, '#bd9363', 0, -.74, .2, .25, .17, .42); limbs.push(leg);
  }
  smile(head, '#557147', 0, -.22, .43, .65);
  if (i % 2) { cylinder(head, '#6c4b7c', 0, .5, 0, .72, .1); cylinder(head, '#6c4b7c', 0, .89, 0, .42, .85, 0); }
  batchStatic(head); batchStatic(g, [head, ...limbs]);
  g.userData.limbs = limbs; g.userData.head = head; g.userData.skin = skin;
  return g;
}

function fishModel(parent, x, z, i) {
  const g = group(parent, x, .02, z), color = ['#edb35c', '#78c1b9', '#eda299'][i % 3];
  ellipsoid(g, color, 0, 0, 0, .5, .22, .18);
  const tail = cylinder(g, color, -.56, 0, 0, .25, .3, 0, 3); tail.rotation.z = Math.PI / 2;
  ellipsoid(g, '#fff5dc', .23, .05, .17, .09, .09, .025); ball(g, '#234651', .25, .05, .197, .04);
  return g;
}

function pumpkin(parent, x, z) {
  const g = group(parent, x, .3, z); ball(g, '#eb9241', 0, .3, 0, .6);
  cylinder(g, '#567846', 0, .95, 0, .1, .28);
  box(g, '#ffe0a1', -.2, .4, .55, .15, .15, .04, true); box(g, '#ffe0a1', .2, .4, .55, .15, .15, .04, true);
  box(g, '#ffe0a1', 0, .15, .57, .3, .07, .03, true);
}

export class World {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.camera = new THREE.PerspectiveCamera(46, 1, .2, 240);
    this.yaw = 0; this.pitch = .35; this.follow = new THREE.Vector3(); this.project = new THREE.Vector3();
    this.scratch = new THREE.Vector3(); this.center = new THREE.Vector3(); this.batchMatrix = new THREE.Matrix4(); this.hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
    this.scene = new THREE.Scene();
    this.resize();
  }
  resize() {
    const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }
  clear() {
    if (this.scene) {
      this.scene.traverse(o => { if (o.isSprite) { o.material.map?.dispose(); o.material.dispose(); } });
      this.scene.traverse(o => { if (o.isInstancedMesh) o.dispose(); });
      this.scene.clear();
    }
    this.scene = new THREE.Scene(); this.effects = [];
    this.dynamicGeometry?.forEach(g => g.dispose()); this.dynamicGeometry = [];
    this.sun?.shadow.map?.dispose();
    this.starsMaterial?.dispose(); this.starsMaterial = null;
    this.skyMaterial?.dispose(); this.skyMaterial = null; this.sky = null;
    this.float = null; this.flame = null; this.water = null;
    this.swimmingFish = []; this.fishJump = null;
    this.shotMeshes = new Map(); this.fountainJets = []; this.spotMarkers = [];
    this.animationBatches = []; this.waterShader = null;
    this.fishingRig = null; this.fishingAction = null;
  }
  build(state, preview = false) {
    this.clear(); this.state = state; this.preview = preview; this.yaw = 0; this.pitch = .35;
    const { stage } = state; this.scene.background = new THREE.Color(stage.color);
    if (stage.type === 'battle') this.pitch = .18;
    if (stage.type === 'space') { this.yaw = -.3; this.pitch = .5; }
    this.viewDistance = 20;
    this.scene.fog = new THREE.Fog(stage.color, stage.type === 'space' ? 55 : 55, 150);
    const hemi = new THREE.HemisphereLight('#ffeedc', '#557075', stage.type === 'space' ? 1.6 : 1.8); this.scene.add(hemi);
    this.sun = new THREE.DirectionalLight(stage.type === 'party' ? '#ffbe86' : '#fff0d6', 2.4);
    this.sun.position.set(-14, 25, 12); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024); this.sun.shadow.camera.left = -23; this.sun.shadow.camera.right = 23;
    this.sun.shadow.camera.top = 25; this.sun.shadow.camera.bottom = -25; this.sun.shadow.camera.far = 90; this.sun.shadow.normalBias = .06;
    this.scene.add(this.sun, this.sun.target);
    this.root = group(this.scene);
    this.skyDome(stage.id === 'sol' ? 'run' : stage.type);
    const space = ['space', 'run'].includes(stage.type);
    if (space || stage.type === 'party') this.stars();
    if (stage.id === 'sol') this.solarStation();
    else if (stage.type === 'space') this.spaceEnvironment();
    else if (stage.type === 'run') this.spaceHome();
    else if (stage.type === 'battle') this.dubai();
    else if (stage.type === 'fish') this.fishingLake();
    else if (stage.type === 'skate') this.lakeside();
    else if (stage.type === 'party') this.party();
    else this.countryside(false);
    batchStatic(this.root, [this.float, this.flame, ...this.fountainJets, ...this.spotMarkers.map(p => p.ring)]);
    if (stage.type === 'fish') this.swimmingFish = Array.from({ length: 9 }, (_, i) => fishModel(this.root, 6 + i % 3 * 2, -6 - i * 5, i));

    this.julia = girl(this.root, 'julia', stage.type === 'skate', stage.type === 'skate');
    this.nina = girl(this.root, 'nina', stage.type === 'skate', stage.type === 'skate');
    this.people = [this.julia, this.nina];
    this.dogs = DOGS.map((d, i) => dog(this.root, d, i));
    if (stage.type === 'fish') this.createFishingRig();
    this.targetMeshes = state.targets.map((t, i) => {
      let m;
      if (stage.item === 'alien') m = saucer(this.root, t.x, -t.d);
      else if (stage.item === 'zombie') m = zombie(this.root, t.x, -t.d, i);
      else if (stage.item === 'battery') {
        m = group(this.root, t.x, 1.4, -t.d); box(m, '#5ed3c0', 0, 0, 0, .8, 1.2, .6, true); box(m, '#f9e3a3', 0, .72, 0, .3, .2, .4);
        box(m, '#fff6dc', 0, 0, .32, .15, .6, .04, true);
      } else m = star(this.root, t.x, 1.6, -t.d);
      if (['alien', 'zombie'].includes(stage.item)) {
        const ring = mesh(m, geometry('charge-ring', () => new THREE.TorusGeometry(1, .06, 6, 24)), '#ffb068', 0, stage.item === 'alien' ? -.8 : .08, 0, 1.4, 1.4, 1.4, true);
        ring.rotation.x = Math.PI / 2; ring.visible = false; m.userData.chargeRing = ring;
        m.userData.health = Array.from({ length: t.maxHp }, (_, j) => ball(m, '#9debd3', (j - (t.maxHp - 1) / 2) * .35, stage.item === 'alien' ? 1.7 : 3.6, 0, .11, true));
      }
      return m;
    });
    this.obstacleMeshes = state.obstacles.map(o => {
      const g = group(this.root, o.x, 0, -o.d);
      if (stage.type === 'space') mesh(g, geometry('rock', () => new THREE.IcosahedronGeometry(1, 0)), '#8c87a0', 0, 2, 0, 1, 1, 1);
      else if (stage.type === 'skate') { box(g, '#fff2d5', 0, .05, 0, 1.3, .1, 1.3); cylinder(g, '#ef9858', 0, .65, 0, .55, 1.2, .08, 4); }
      else if (stage.type === 'run') { box(g, '#b492ce', 0, .45, 0, 1.8, .9, 1.1); box(g, '#f9db97', 0, .95, 0, 1.8, .1, 1.1, true); }
      else { box(g, '#b38d65', 0, .45, 0, 1.6, .9, 1.2); }
      return g;
    });
    if (stage.type === 'space') {
      this.ship = flightShip(this.root);
      this.people.forEach((p, i) => { p.root.scale.setScalar(.5); this.ship.add(p.root); p.root.position.set(i ? -.64 : .64, 1.45, -.15); p.root.rotation.y = Math.PI; });
      this.dogs.forEach((d, i) => { this.ship.add(d.root); d.root.scale.setScalar(.33); d.root.position.set((i - 2) * .47, 1.45, 1.25); d.root.rotation.y = Math.PI; });
    } else this.ship = null;
    this.prepareAnimationBatches([...this.people.map(p => p.root), ...this.dogs.map(d => d.root), ...this.targetMeshes, ...(this.ship ? [this.ship] : [])]);
    this.follow.set(0, 1, 0); this.update(state, 0, { x: 0, forward: 0 });
  }
  prepareAnimationBatches(roots) {
    const seen = new Set(), groups = new Map(); this.root.updateMatrixWorld(true);
    for (const root of roots) root.traverse(o => {
      if (!o.isMesh || seen.has(o)) return; seen.add(o);
      const key = `${o.geometry.uuid}-${o.material.uuid}-${o.castShadow}`;
      if (!groups.has(key)) groups.set(key, []);
      const count = o.isInstancedMesh ? o.count : 1;
      for (let i = 0; i < count; i++) {
        const local = new THREE.Matrix4(); if (o.isInstancedMesh) o.getMatrixAt(i, local);
        groups.get(key).push({ object: o, local });
      }
    });
    for (const entries of groups.values()) {
      if (entries.length < 2) continue;
      const source = entries[0].object, mesh = new THREE.InstancedMesh(source.geometry, source.material, entries.length);
      mesh.castShadow = source.castShadow; mesh.receiveShadow = true; mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.root.add(mesh);
      entries.forEach(e => e.object.layers.set(1)); this.animationBatches.push({ mesh, entries });
    }
  }
  updateAnimationBatches() {
    this.root.updateMatrixWorld(true);
    for (const { mesh, entries } of this.animationBatches) {
      entries.forEach((e, i) => {
        let visible = true; for (let node = e.object; node && node !== this.root; node = node.parent) if (!node.visible) { visible = false; break; }
        mesh.setMatrixAt(i, visible ? this.batchMatrix.multiplyMatrices(e.object.matrixWorld, e.local) : this.hiddenMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  }
  stars() {
    let seed = 28;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const points = [];
    for (let i = 0; i < 430; i++) points.push((rand() - .5) * 220, 8 + rand() * 75, (rand() - .6) * 200);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); this.dynamicGeometry.push(g);
    const m = new THREE.PointsMaterial({ color: '#fff0ca', size: .24, sizeAttenuation: true });
    const stars = new THREE.Points(g, m); this.root.add(stars); this.starsMaterial = m;
  }
  skyDome(type) {
    const night = ['space', 'run', 'party'].includes(type), sunset = type === 'battle';
    this.skyMaterial = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: new THREE.Color(night ? '#101b37' : sunset ? '#91aec5' : '#77b9d2') },
        bottom: { value: new THREE.Color(night ? '#3b4d67' : sunset ? '#f6c398' : '#e5edda') } },
      vertexShader: 'varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform vec3 top;uniform vec3 bottom;varying vec3 vDirection;
        void main(){vec3 dir=normalize(vDirection);float h=smoothstep(-.1,.65,dir.y);
          vec3 color=mix(bottom,top,h);float sun=pow(max(0.,dot(dir,normalize(vec3(-.6,.3,-.7)))),160.);
          color+=vec3(1.,.8,.5)*sun*.7;gl_FragColor=vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    this.sky = new THREE.Mesh(geometry('sky', () => new THREE.SphereGeometry(170, 16, 12)), this.skyMaterial);
    this.sky.frustumCulled = false; this.scene.add(this.sky);
  }
  ground(color, width = 300, length = 400) { return box(this.root, color, 0, -.5, -100, width, .8, length); }
  solarStation() {
    this.stars(); this.route(34, '#8c6476');
    const sun = ball(this.root, '#f6a63e', -38, 12, -76, 32); sun.material = mat('#ef913b', true);
    for (let i = 0; i < 8; i++) {
      const halo = mesh(this.root, geometry('sun-halo', () => new THREE.TorusGeometry(1, .025, 6, 64)), '#f3b34d', -38, 12, -76, 34 + i * .45, 34 + i * .45, 34 + i * .45, true); halo.rotation.z = i * .3;
    }
    for (let i = 0; i < 10; i++) for (const x of [-9.3, 9.3]) {
      cylinder(this.root, '#d7ba93', x, .65, -i * 4, .1, 1.4);
      box(this.root, '#ebcfa5', x, 1.2, -i * 4 - 2, .06, .06, 4);
      ball(this.root, '#ffdd98', x, .8, -i * 4, .12, true);
    }
    const earth = ball(this.root, '#4a9bb9', 18, 9, -61, 5);
    ellipsoid(this.root, '#83b78a', 17.2, 10.2, -56.3, 2.1, 1.4, .3);
    textSprite(this.root, 'TERRA', 18, 16, -61, '#d8f3e6', 4);
    rocket(this.root, 0, -35); this.launchPad(-35);
    for (const x of [-14, 14]) {
      const panel = box(this.root, '#4d6c9a', x, 1.1, -10, 5.5, .2, 14); panel.rotation.z = x < 0 ? .25 : -.25;
      for (let i = 0; i < 9; i++) box(this.root, '#b2cbe4', x, 1.25, -4 - i * 1.5, 5.2, .035, .03);
    }
  }
  route(length, color = '#dac29d') {
    box(this.root, color, 0, -.02, -length / 2, 16.5, .15, length + 15);
    for (const side of [-1, 1]) box(this.root, '#f8e5b8', side * 8.5, .12, -length / 2, .35, .3, length + 15);
  }
  countryside(fishing) {
    this.ground('#80ad78');
    if (fishing) {
      this.water = box(this.root, '#55aeb2', 8, -.08, -12, 28, .18, 38);
      box(this.root, '#b38a62', 0, .1, -4, 8, .35, 15);
      for (let i = -1; i < 12; i++) box(this.root, '#d0a77c', 0, .32, 2 - i * 1.1, 7.9, .08, 1);
      for (const x of [-3.9, 3.9]) for (const z of [2, -4, -10]) box(this.root, '#856543', x, -.15, z, .3, 1.8, .3);
      this.float = ball(this.root, '#ef779d', 1, .4, -10, .23); cylinder(this.root, '#f8ebc8', 1, .72, -10, .035, .5);
      this.rod = box(this.root, '#675347', -1, 2.3, -2, .07, .07, 5); this.rod.rotation.x = -.2;
      const line = cylinder(this.root, '#fff6df', 0, 1.07, -7.2, .012, 6.1);
      line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(2, -1.4, -5.8).normalize());
      house(this.root, -16, -20);
    } else { this.route(34, '#d5c39d'); house(this.root, -15, -8); rocket(this.root, 0, -35, 1.05); this.launchPad(-35); }
    for (let i = 0; i < 16; i++) {
      const side = i % 2 ? 1 : -1; tree(this.root, side * (12 + (i % 3) * 4), -i * 5 + 7, .8 + (i % 3) * .17, i % 4 === 0);
    }
    for (let i = 0; i < 45; i++) {
      const x = (i % 2 ? -1 : 1) * (9 + i % 9);
      const z = -(i * 3.7 % 90);
      cylinder(this.root, '#6c995e', x, .3, z, .045, .7);
      ball(this.root, ['#fff0a5', '#f2b1bb', '#e1c4eb'][i % 3], x, .65, z, .18);
    }
    // Morros baixos mantêm a paisagem rural sem inventar um ponto turístico.
    for (let i = 0; i < 6; i++) mesh(this.root, geometry('hill', () => new THREE.SphereGeometry(1, 12, 8)), ['#6d9878', '#7da184'][i % 2], -50 + i * 20, 1, -88, 22, 12 + i % 3 * 3, 16);
    for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
      box(this.root, '#eee0b9', side * 10.4, .75, -i * 7, .15, 1.5, .15);
      box(this.root, '#eee0b9', side * 10.4, .7, -i * 7 - 3, .1, .18, 7);
    }
  }
  fishingLake() {
    this.ground('#78a77d');
    this.water = box(this.root, '#61b7be', 0, -.13, -25, 48, .12, 85);
    for (const p of FISH_PATH) {
      const cuts = [p.from, ...FISH_GAPS.filter(g => g.from > p.from && g.from < p.to).flatMap(g => [g.from, g.to]), p.to];
      for (let i = 0; i < cuts.length - 1; i++) {
        const from = cuts[i], to = cuts[i + 1];
        if (FISH_GAPS.some(g => (from + to) / 2 > g.from && (from + to) / 2 < g.to)) continue;
        box(this.root, p.width < 3 ? '#a9825c' : '#c8a276', p.x, .05, -(from + to) / 2, p.width, .28, to - from);
        for (let d = from + .3; d < to; d += .8) box(this.root, '#d7b78b', p.x, .21, -d, p.width - .1, .05, .045);
        if (p.width < 3) for (const side of [-1, 1]) {
          for (const d of [from + .2, to - .2]) cylinder(this.root, '#826448', p.x + side * (p.width / 2 - .1), .55, -d, .075, 1);
          box(this.root, '#f4ddac', p.x + side * (p.width / 2 - .1), .95, -(from + to) / 2, .035, .035, to - from);
        }
      }
    }
    this.state.fishingSpots.forEach((p, i) => {
      const marker = group(this.root, p.x, .24, -p.d);
      const ring = mesh(marker, geometry('spot-ring', () => new THREE.TorusGeometry(1.05, .07, 6, 24)), '#ffe49c', 0, .05, 0, 1, 1, 1, true); ring.rotation.x = Math.PI / 2;
      const sign = textSprite(marker, `${i + 1}`, 0, 2.5, -.7, '#ffe8ab', 1.05); this.spotMarkers.push({ ring, sign });
      cylinder(marker, '#79664d', -1.2, 1.1, 0, .06, 2.2);
      ball(marker, '#ffe5a1', -1.2, 2.25, 0, .16, true);
    });
    this.float = ball(this.root, '#ed88a9', 1, .1, -6, .22);
    house(this.root, -29, -24);
    for (let i = 0; i < 18; i++) tree(this.root, (i % 2 ? -1 : 1) * (26 + i % 3 * 3), 8 - i * 4, .9 + i % 3 * .14);
    for (let i = 0; i < 8; i++) ellipsoid(this.root, '#6e9a77', -65 + i * 19, 2, -90, 20, 9, 15);
    for (let i = 0; i < 12; i++) {
      const leaf = cylinder(this.root, '#5f9f77', (i % 2 ? -1 : 1) * (8 + i % 5), -.02, -i * 4, .55, .05, .55, 12);
      ball(this.root, '#f4d9dc', leaf.position.x, .15, leaf.position.z, .15);
    }
  }
  createFishingRig() {
    const cylinderGeo = geometry('fishing-segment', () => new THREE.CylinderGeometry(1, 1, 1, 6));
    const rod = new THREE.InstancedMesh(cylinderGeo, mat('#665242'), 8);
    const line = new THREE.InstancedMesh(cylinderGeo, mat('#fff5cf', true), 32);
    rod.frustumCulled = line.frustumCulled = false; line.visible = false;
    rod.instanceMatrix.setUsage(THREE.DynamicDrawUsage); line.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.root.add(rod, line); const fish = fishModel(this.root, 0, 0, 0); fish.scale.setScalar(1.3); fish.visible = false;
    const ripples = Array.from({ length: 3 }, () => {
      const ring = mesh(this.root, geometry('fishing-ripple', () => new THREE.TorusGeometry(1, .018, 5, 32)), '#c8f0e7', 0, .03, 0, .2, .2, .2);
      ring.rotation.x = Math.PI / 2; return ring;
    });
    this.fishingRig = { rod, line, fish, ripples, rodPoints: new Float32Array(27), linePoints: new Float32Array(99),
      hand: new THREE.Vector3(), tip: new THREE.Vector3(), water: new THREE.Vector3(), end: new THREE.Vector3(),
      a: new THREE.Vector3(), b: new THREE.Vector3(), direction: new THREE.Vector3(), mid: new THREE.Vector3(), scale: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), q: new THREE.Quaternion(), matrix: new THREE.Matrix4() };
  }
  fishingSegments(object, points, radius) {
    const r = this.fishingRig;
    for (let i = 0; i < object.count; i++) {
      r.a.fromArray(points, i * 3); r.b.fromArray(points, i * 3 + 3);
      r.direction.subVectors(r.b, r.a); const length = r.direction.length();
      r.mid.addVectors(r.a, r.b).multiplyScalar(.5); r.q.setFromUnitVectors(r.up, r.direction.normalize());
      r.scale.set(radius, Math.max(.001, length), radius); r.matrix.compose(r.mid, r.q, r.scale); object.setMatrixAt(i, r.matrix);
    }
    object.instanceMatrix.needsUpdate = true;
  }
  updateFishing(s, dt, leader, friend, moving) {
    const r = this.fishingRig; if (!r) return;
    const spot = s.fishingSpots[s.fish.spot] || s.fishingSpots.find(p => p.caught < p.quota) || s.fishingSpots[2];
    if (!moving) { leader.root.rotation.y = Math.PI; leader.limbs[2].rotation.x = -.8; leader.elbows[1].rotation.x = -.35; }
    if (s.fish.phase === 'reeling') { friend.limbs[0].rotation.x = -.9; friend.limbs[2].rotation.x = -.7; friend.root.position.y += Math.abs(Math.sin(s.time * 7)) * .16; }
    leader.root.updateWorldMatrix(true, true);
    r.hand.set(0, -.36, .02).applyMatrix4(leader.elbows[1].matrixWorld);
    if (this.fishingAction) this.fishingAction.age += dt;
    const action = this.fishingAction, age = action?.age ?? 0;
    if (s.fish.phase === 'idle' && action?.type !== 'reel') this.fishingAction = null;
    r.water.set(spot.x + 2.5, .08, -spot.d - 1.8);
    const windup = action?.type === 'cast' && age < .22 ? Math.sin(age / .22 * Math.PI) : 0;
    const tension = s.fish.phase === 'bite' ? .4 + Math.sin(s.time * 23) * .1 : action?.type === 'reel' ? .6 : .04;
    r.tip.set(r.hand.x + .15, r.hand.y + 2.2 + windup * .6, r.hand.z - 2.65 + windup * 3.7);
    for (let i = 0; i < 9; i++) {
      const k = i / 8, bend = Math.sin(k * Math.PI) * tension;
      r.rodPoints[i * 3] = r.hand.x + (r.tip.x - r.hand.x) * k;
      r.rodPoints[i * 3 + 1] = r.hand.y + (r.tip.y - r.hand.y) * k - bend;
      r.rodPoints[i * 3 + 2] = r.hand.z + (r.tip.z - r.hand.z) * k - bend * .5;
    }
    this.fishingSegments(r.rod, r.rodPoints, .035);
    r.end.copy(r.water);
    if (action?.type === 'cast' && age < .7) {
      const k = Math.max(0, Math.min(1, (age - .12) / .58));
      r.end.lerpVectors(r.hand, r.water, k); r.end.y += Math.sin(k * Math.PI) * 2;
    }
    if (s.fish.phase === 'bite') r.end.y -= .15 + Math.abs(Math.sin(s.time * 22)) * .12;
    if (this.float) { this.float.position.copy(r.end); this.float.visible = s.fish.phase !== 'reeling' || age > 1.3; }
    r.fish.visible = false;
    if (s.fish.phase === 'waiting' && action?.type === 'cast' && age > .6 || s.fish.phase === 'bite') {
      const approach = Math.max(0, 1 - Math.max(0, age - .6) / .6);
      r.fish.visible = true; r.fish.position.set(r.water.x + approach * 3, -.03 + (s.fish.phase === 'bite' ? Math.abs(Math.sin(s.time * 14)) * .18 : 0), r.water.z);
      r.fish.rotation.set(0, Math.PI, Math.sin(s.time * 12) * .1);
    }
    if (action?.type === 'reel') {
      r.fish.visible = age < 2;
      if (age < 1.15) {
        const k = Math.min(1, age / 1.15); r.fish.position.lerpVectors(r.water, r.hand, k); r.fish.position.y += Math.sin(k * Math.PI) * 1.8;
      } else if (age < 1.4) r.fish.position.copy(r.hand);
      else {
        const k = Math.min(1, (age - 1.4) / .6); r.fish.position.lerpVectors(r.hand, r.water, k); r.fish.position.y += Math.sin(k * Math.PI) * 1.1;
      }
      r.fish.rotation.set(Math.sin(s.time * 17) * .2, 0, Math.sin(s.time * 22) * .3);
      if (age < 1.4) r.end.copy(r.fish.position);
      if (age >= 2.2) this.fishingAction = null;
    }
    r.line.visible = s.fish.phase !== 'idle' || action?.type === 'reel' && age < 1.4;
    const sag = s.fish.phase === 'reeling' ? .06 : .55;
    for (let i = 0; i < 33; i++) {
      const k = i / 32; r.linePoints[i * 3] = r.tip.x + (r.end.x - r.tip.x) * k;
      r.linePoints[i * 3 + 1] = r.tip.y + (r.end.y - r.tip.y) * k - Math.sin(k * Math.PI) * sag;
      r.linePoints[i * 3 + 2] = r.tip.z + (r.end.z - r.tip.z) * k;
    }
    this.fishingSegments(r.line, r.linePoints, .018);
    r.ripples.forEach((ring, i) => { ring.position.set(r.water.x, .02, r.water.z); ring.scale.setScalar(.15 + ((s.time * (s.fish.phase === 'bite' ? 2 : .6) + i * .33) % 1) * 1.1); ring.visible = s.fish.phase !== 'idle'; });
  }
  launchPad(z) {
    cylinder(this.root, '#526d73', 0, -.05, z, 5.5, .2, 5.5, 24);
    const ring = mesh(this.root, geometry('torus', () => new THREE.TorusGeometry(1, .13, 8, 20)), '#fff1b5', 0, .12, z, 4.9, 4.9, 4.9, true); ring.rotation.x = Math.PI / 2;
  }
  spaceEnvironment() {
    const earth = ball(this.root, '#4598bb', -26, -12, -49, 22);
    for (let i = 0; i < 12; i++) {
      const patch = mesh(this.root, geometry('ico', () => new THREE.IcosahedronGeometry(1, 1)), '#73ad84', -26 + Math.cos(i * 1.7) * 14, -2 + Math.sin(i) * 9, -32 + Math.cos(i) * 3, 5, 3, 1.3); patch.rotation.z = i;
    }
    earth.rotation.z = -.2;
    for (let i = 0; i < 18; i++) {
      mesh(this.root, geometry('rock', () => new THREE.IcosahedronGeometry(1, 0)), '#686a83', (i % 2 ? -1 : 1) * (12 + i % 4 * 3), i % 7 - 2, -i * 5, 1.8, 1.4, 1.5);
    }
    // Balizas visuais delimitam a área de voo, sem uma pista no espaço.
    for (const x of [-8, 8]) for (let i = 0; i < 12; i++) ball(this.root, '#72dad3', x, .3, -i * 3.5, .08, true);
  }
  spaceHome() {
    this.route(52, '#5b5f7c');
    for (let i = 0; i < 20; i++) {
      const z = -i * 3;
      for (const x of [-8.2, 8.2]) box(this.root, '#f5d69d', x, .24, z, .13, .08, 1.4, true);
      if (i % 3 === 0) mesh(this.root, geometry('rock', () => new THREE.IcosahedronGeometry(1, 0)), '#626177', i % 2 ? -14 : 15, -2, z, 5, 3, 5);
    }
    house(this.root, -13, -2, true); rocket(this.root, 0, -54); this.launchPad(-54);
    for (let i = 0; i < 10; i++) {
      cylinder(this.root, '#a7b6db', (i % 2 ? -1 : 1) * 11, .5, -i * 5.5, .6, 3 + i % 3, 0, 5);
    }
    ball(this.root, '#c5b1d7', 32, 18, -90, 16);
  }
  dubai() {
    this.ground('#e2ba8c'); this.route(40, '#e7ceb0');
    for (const x of [-12, 12]) for (let i = 0; i < 7; i++) palm(this.root, x, 5 - i * 9);
    for (let i = 0; i < 20; i++) {
      const side = i % 2 ? -1 : 1, x = side * (19 + i % 4 * 4), z = -15 - Math.floor(i / 2) * 9, height = 8 + (i * 7 % 18);
      box(this.root, ['#a6b5bf', '#9baab7', '#c3ad9c', '#91a9ba'][i % 4], x, height / 2, z, 4, height, 4);
      for (let y = 2; y < height; y += 2) box(this.root, '#fbe3ac', x, y, z + 2.03, 3.2, .12, .03, true);
    }
    const burj = group(this.root, 0, 0, -66); burj.scale.setScalar(.48);
    for (let i = 0; i < 9; i++) {
      const w = 6.2 - i * .58;
      box(burj, i % 2 ? '#b5cad3' : '#95b2c7', 0, 2.7 + i * 3.6, 0, w, 5.4, w * .8);
      for (let j = 0; j < 3; j++) box(burj, '#eee4ca', 0, 1.1 + i * 3.6 + j * 1.5, w * .4 + .03, w, .08, .04);
    }
    cylinder(burj, '#d9d5c4', 0, 39, 0, .22, 12, .03);
    // Dubai Frame, ao fundo, sem substituir a silhueta do Burj Khalifa.
    box(this.root, '#cda56b', -23, 9, -50, .8, 18, 1.2); box(this.root, '#cda56b', -12, 9, -50, .8, 18, 1.2); box(this.root, '#cda56b', -17.5, 17.7, -50, 11.8, .8, 1.2);
    for (let i = 0; i < 16; i++) pumpkin(this.root, (i % 2 ? -1 : 1) * 9.4, -i * 2.5);
    // Praça de Downtown: espelho d'água, fonte e piso em pedra, além da silhueta.
    cylinder(this.root, '#d0af86', 14, .15, -13, 5, .45, 5, 32);
    cylinder(this.root, '#73b7c2', 14, .41, -13, 4.6, .08, 4.6, 32);
    for (let i = 0; i < 9; i++) {
      const a = i * Math.PI * 2 / 9, x = 14 + Math.cos(a) * 3.2, z = -13 + Math.sin(a) * 3.2;
      const jet = ellipsoid(this.root, '#d9f4ef', x, 1.7, z, .065, 1.5, .065); jet.material = mat('#b0e3e2', true); this.fountainJets.push(jet);
    }
    for (let i = 0; i < 10; i++) for (const x of [-6, 0, 6]) {
      const tile = box(this.root, '#c9ac88', x, .083, -i * 3.7, .7, .015, .7); tile.rotation.y = Math.PI / 4;
    }
    textSprite(this.root, 'DUBAI', -13, 3.7, -7, '#ffe5ad', 4);
  }
  lakeside() {
    this.ground('#89b48a'); this.route(64, '#e1cba9');
    this.water = box(this.root, '#6cb9c0', 29, -.1, -30, 37, .1, 105);
    for (let i = 0; i < 16; i++) {
      const z = 5 - i * 5;
      box(this.root, '#f7ead0', 9.5, .85, z, .16, 1.7, .16); box(this.root, '#f7ead0', 9.5, 1.3, z - 2.5, .12, .15, 5);
      if (i % 2 === 0) tree(this.root, -12, z, .9);
      if (i % 3 === 0) { box(this.root, '#687d71', -9.4, 2.2, z, .12, 4.4, .12); ball(this.root, '#ffedb0', -9.4, 4.5, z, .35, true); }
    }
    for (let i = 0; i < 8; i++) { const h = house(this.root, 35 + i % 2 * 13, -i * 11); h.scale.setScalar(.7); }
    for (const [x, color] of [[-10, '#67b3dd'], [10, '#52a36b']]) {
      cylinder(this.root, '#e2d8ba', x, 4, -3, .07, 8); box(this.root, color, x + 1.2, 7, -3, 2.5, 1.5, .06);
      if (x > 0) { const b = box(this.root, '#ebce60', x + 1.2, 7, -2.94, .9, .9, .04); b.rotation.z = Math.PI / 4; ball(this.root, '#3c69a7', x + 1.2, 7, -2.84, .35); }
      else box(this.root, '#fff6e8', x + 1.2, 7, -2.93, 2.5, .5, .04);
    }
    for (const x of [-7, 7]) box(this.root, '#f5b0cd', x, 3, -64, .25, 6, .25);
    box(this.root, '#fff0b9', 0, 5.7, -64, 14, 1, .2);
    for (let i = 0; i < 14; i++) box(this.root, i % 2 ? '#f7f0d3' : '#48576a', -6.5 + i, .12, -62.5, 1, .06, 1);
  }
  party() {
    this.ground('#729b7b');
    this.water = box(this.root, '#457b96', 0, -.12, -43, 100, .1, 30);
    for (const x of [-14, 13]) tree(this.root, x, -5, 1.9);
    rocket(this.root, 9, -10, .8);
    house(this.root, -16, -20);
    for (let i = 0; i < 15; i++) {
      const x = -15 + i * 2; ball(this.root, i % 2 ? '#ffe0a1' : '#f7b4cc', x, 7 - Math.cos(x / 13) * 2, -5, .13, true);
    }
    // Bolo e presente de estrela, à altura das meninas.
    box(this.root, '#b2825e', 0, .8, 3.2, 6.2, .25, 2.6);
    for (const x of [-2.4, 2.4]) box(this.root, '#8f6849', x, .35, 3.2, .2, .8, 2);
    cylinder(this.root, '#f3adbf', 0, 1.3, 3.2, 1.05, .8);
    cylinder(this.root, '#fff0cd', 0, 1.73, 3.2, 1.08, .12);
    for (let i = 0; i < 10; i++) ball(this.root, ['#ee719d', '#4cb5b5', '#f8d06c'][i % 3], Math.sin(i * .628) * .9, 1.84, 3.2 + Math.cos(i * .628) * .9, .12);
    // Dois aros formam uma vela 8 em geometria 3D.
    for (const y of [2.12, 2.52]) mesh(this.root, geometry('eight', () => new THREE.TorusGeometry(.22, .085, 8, 16)), '#ffdb8e', 0, y, 3.2);
    this.flame = ball(this.root, '#ffe9a2', 0, 2.94, 3.2, .12, true);
    star(this.root, -1.5, 1.9, 1, '#ffe09b');
    for (let i = 0; i < 14; i++) {
      const x = (i % 2 ? -1 : 1) * (5 + i % 4 * 2), z = -3 - i % 5 * 3;
      const b = ball(this.root, ['#ec94b2', '#8cd0cc', '#f1d992'][i % 3], x, 3 + i % 3, z, .5);
      box(this.root, '#e1dfc8', x, 1.8, z, .02, 2.6, .02); b.scale.y = 1.2;
    }
  }
  orbit(dx, dy) { this.yaw -= dx * .006; this.pitch = Math.max(.12, Math.min(1.05, this.pitch + dy * .004)); }
  effect(event) {
    if (event.type === 'cast' && this.fishingRig) this.fishingAction = { type: 'cast', age: 0 };
    if (event.type === 'caught' && this.fishingRig) this.fishingAction = { type: 'reel', age: 0 };
    if (event.type === 'bubble') {
      const t = this.state.targets[event.target];
      this.effects.push({ type: 'bubble', life: .45, max: .45, from: new THREE.Vector3(this.state.x, 1.7, -this.state.d),
        to: new THREE.Vector3(t?.x ?? this.state.x, 2, -(t?.d ?? this.state.d + 10)),
        obj: ball(this.root, '#9de8e4', this.state.x, 2, -this.state.d, .45, true) });
    }
    if (['collect', 'caught', 'hit', 'celebrate', 'complete'].includes(event.type)) {
      const t = this.state.targets[event.target];
      const x = t?.x ?? this.state.x, z = -(t?.d ?? this.state.d);
      const count = ['celebrate', 'complete'].includes(event.type) ? 50 : 12;
      for (let i = 0; i < count; i++) {
        const obj = box(this.root, ['#ffd78c', '#f68fb5', '#86d7cc'][i % 3], x, 2, z, .12, .2, .08, true);
        const a = i * 2.399;
        this.effects.push({ type: 'spark', life: 1.4, max: 1.4, obj, vx: Math.cos(a) * (2 + i % 3), vz: Math.sin(a) * (2 + i % 3), vy: 4 + i % 5 });
      }
    }
  }
  update(s, dt, input = {}) {
    const time = s.time, party = s.stage.type === 'party', fish = s.stage.type === 'fish';
    const moving = Math.hypot(input.x || 0, input.forward || 0) > .1;
    const leader = s.leader === 'julia' ? this.julia : this.nina;
    const friend = s.leader === 'julia' ? this.nina : this.julia;
    if (this.ship) {
      this.ship.position.set(s.x, .15 + Math.sin(time * 2) * .08, -s.d);
      this.ship.rotation.z += (-(input.x || 0) * .16 - this.ship.rotation.z) * Math.min(1, dt * 6);
      this.ship.rotation.x = (input.forward || 0) * .045;
      this.people.forEach((p, i) => {
        p.head.rotation.y = Math.sin(time * (i ? 1.1 : .8) + i) * .13;
        p.limbs[0].rotation.x = -.65 + Math.sin(time * 2 + i) * .08;
        p.limbs[2].rotation.x = -.65 - Math.sin(time * 2 + i) * .08;
        p.elbows.forEach(e => { e.rotation.x = -.4; }); p.knees.forEach(k => { k.rotation.x = .6; });
        p.eyelids.forEach(lid => { lid.visible = (time + i * 1.6) % 5 < .14; });
      });
      this.dogs.forEach((d, i) => { const pose = dogPose(i, time, false); d.tail.rotation.z = pose.tail; d.head.rotation.y = Math.sin(time + i) * .2; d.label.visible = pose.showName; });
    } else {
      const base = fish ? .3 : .15;
      leader.root.position.set(party ? 0 : s.x, s.y + base, -s.d);
      friend.root.position.set(party ? 1.5 : s.helper.x, party ? base : s.helper.y + base, party ? 0 : -s.helper.d);
      if (moving) {
        const facing = Math.atan2(input.x, -input.forward);
        leader.root.rotation.y = facing;
        const dx = s.x - s.helper.x, dz = -(s.d - s.helper.d);
        friend.root.rotation.y = Math.atan2(dx, dz);
      } else if (party || this.preview) { leader.root.rotation.y = -.25; friend.root.rotation.y = .25; }
      this.people.forEach(p => {
        const follower = p !== leader;
        const motion = girlPose(p.name, time, moving, (follower ? s.helper.y : s.y) > .1, s.stage.type === 'skate');
        p.root.position.y += motion.bob; p.root.rotation.x = motion.lean; p.root.rotation.z = motion.sway;
        p.head.rotation.y = motion.head;
        p.limbs.forEach((limb, j) => { limb.rotation.x = motion.limbs[j]; if (j % 2 === 0) limb.rotation.z = (j === 0 ? -1 : 1) * motion.armOut; });
        p.elbows.forEach((e, j) => { e.rotation.x = moving ? -.22 - Math.max(0, motion.limbs[j * 2]) * .6 : -.08; });
        p.knees.forEach((k, j) => { k.rotation.x = moving ? Math.max(0, -motion.limbs[j * 2 + 1]) * .9 : 0; });
        p.eyelids.forEach(lid => { lid.visible = (time + (p.name === 'nina' ? 2.1 : 0)) % 4.7 < .15; });
        if (p.head.userData.pony) p.head.userData.pony.rotation.x = -.3 + motion.bob * 3 + Math.sin(time * 6) * .045;
        if (follower && s.helper.action === 'shoot' && time - s.playerFiredAt < 4) p.limbs[2].rotation.x = -1.15;
        p.root.visible = !(s.invincible > 0 && Math.floor(time * 12) % 2);
      });
      this.dogs.forEach((d, i) => {
        const pose = dogPose(i, time, moving, s.dogCallUntil > time); d.activity = pose.activity;
        const spread = fish ? .3 : 1.1;
        let x = party ? (i - 2) * 1.65 : s.x + (i - 2) * spread + pose.x * (fish ? .2 : 1);
        const z = party ? 5 : -s.d + (pose.activity === 'greet' ? 1.2 : 4 + pose.lag);
        let hop = pose.hop;
        if (fish) {
          const path = FISH_PATH.find(p => -z >= p.from && -z <= p.to); if (path) x = path.x + (i - 2) * .22 + pose.x * .12;
          const gap = FISH_GAPS.find(g => -z > g.from - 1 && -z < g.to + 1); if (gap) hop = Math.max(hop, Math.sin((-z - gap.from + 1) / (gap.to - gap.from + 2) * Math.PI));
        }
        d.root.position.lerp(this.scratch.set(x, hop + (fish ? .2 : 0), z), dt ? Math.min(1, dt * (3 + i * .5)) : 1);
        const heading = moving ? Math.atan2(x - d.root.position.x, z - d.root.position.z) : 0;
        d.root.rotation.y = heading + pose.spin;
        d.head.rotation.x = pose.pitch; d.head.rotation.y = Math.sin(time * .9 + i) * .12;
        d.tail.rotation.z = pose.tail; d.body.rotation.x = pose.activity === 'sit' ? -.2 : 0;
        d.legs.forEach((leg, j) => { leg.rotation.x = pose.activity === 'sit' && j % 2 === 0 ? -.8 : pose.legs[j]; });
        d.ears.forEach((ear, j) => { ear.rotation.x = pose.hop * .6 + Math.sin(time * 7 + j + i) * (moving ? .12 : .025); });
        d.label.visible = pose.showName;
      });
    }
    // Projéteis e inimigos compartilham as coordenadas da simulação, sem acerto instantâneo.
    const liveShots = new Set(s.shots.map(p => p.id));
    for (const [id, object] of this.shotMeshes) if (!liveShots.has(id)) { object.removeFromParent(); this.shotMeshes.delete(id); }
    for (const p of s.shots) {
      if (!this.shotMeshes.has(p.id)) {
        const g = group(this.root); ball(g, p.owner === 'alien' ? '#f19ac5' : p.owner === 'helper' ? '#ffe4a1' : '#9eebe6', 0, 0, 0, p.owner === 'alien' ? .36 : .25, true);
        const trail = ellipsoid(g, p.owner === 'alien' ? '#f8c2d5' : '#defdf5', 0, 0, -.3, .09, .09, .55); trail.material = mat(p.owner === 'alien' ? '#df85b2' : '#a2e2de', true);
        this.shotMeshes.set(p.id, g);
      }
      const object = this.shotMeshes.get(p.id); object.position.set(p.x, s.stage.type === 'space' ? 2 : 1.6, -p.d); object.rotation.y = Math.atan2(p.vx, -p.vd);
    }
    s.targets.forEach((t, i) => {
      const obj = this.targetMeshes[i]; obj.visible = t.active && (!t.hit || s.stage.item === 'zombie');
      obj.position.x = t.x; obj.position.z = -t.d;
      if (obj.userData.chargeRing) {
        obj.userData.chargeRing.visible = t.charge > 0 && !t.hit;
        obj.userData.chargeRing.scale.setScalar(1.1 + t.charge * .8);
        obj.userData.health.forEach((orb, j) => { orb.visible = j < t.hp; });
      }
      if (s.stage.item === 'alien') {
        obj.position.y = 2.3 + Math.sin(time * 2.6 + i) * .4;
        obj.rotation.z = Math.sin(time * 2 + i) * (t.charge ? .16 : .06);
        obj.rotation.y = Math.sin(time * 1.4 + i) * .25;
        obj.scale.setScalar(t.flash > 0 ? 1.15 : 1);
      } else if (s.stage.item === 'zombie') {
        obj.rotation.y = t.hit ? Math.sin(time * 2) * .8 : Math.atan2(s.x - t.x, -(s.d - t.d));
        obj.rotation.z = Math.sin(time * (t.hit ? 7 : 4) + i) * (t.hit ? .16 : .04);
        obj.position.y = t.hit ? Math.abs(Math.sin(time * 5 + i)) * .4 : t.phase === 'windup' ? -.15 * t.charge : 0;
        obj.userData.head.rotation.z = Math.sin(time * 2.5 + i) * .08;
        obj.userData.limbs.forEach((limb, j) => { limb.rotation.x = t.hit ? Math.sin(time * 7 + j) * .8 : t.phase === 'windup' ? -t.charge * 1.1 : Math.sin(time * (t.phase === 'dash' ? 16 : 7) + [0, Math.PI, Math.PI, 0][j] + i) * .55; });
        obj.scale.setScalar(t.flash > 0 ? 1.08 : 1);
        if (t.hit && !obj.userData.freed) { obj.userData.freed = true; star(obj, 0, 3.7, 0).scale.setScalar(.35); }
      } else { obj.rotation.y = time * 1.4; obj.position.y = 1.7 + Math.sin(time * 3 + i) * .2; }
    });
    this.spotMarkers.forEach((m, i) => { const p = s.fishingSpots[i]; m.ring.visible = p.caught < p.quota; m.sign.visible = p.caught < p.quota; m.ring.rotation.z = time * .4; });
    this.fountainJets.forEach((jet, i) => { jet.scale.y = 1.3 + Math.sin(time * 2.2 + i * .7) * .7; jet.position.y = .5 + jet.scale.y; });
    if (this.float) { const p = s.fishingSpots[s.fish.spot] || s.fishingSpots.find(p => p.caught < p.quota) || s.fishingSpots[2]; this.float.position.set(p.x + 2, .1, -p.d - .8); }
    if (this.float) this.float.position.y = .1 + Math.sin(time * (s.fish.phase === 'bite' ? 24 : 3)) * .13;
    this.swimmingFish.forEach((f, i) => { if (f === this.fishJump?.mesh) return; f.position.set(8 + Math.sin(time * .7 + i * 2) * 3, .03, -5 - i * 5 + Math.cos(time + i)); f.rotation.y = Math.cos(time * .7 + i * 2) < 0 ? Math.PI : 0; });
    if (this.fishJump) {
      this.fishJump.time += dt; const k = Math.min(1, this.fishJump.time / 1.4);
      this.fishJump.mesh.position.set(s.x + 2 + k * 4, Math.sin(k * Math.PI) * 3, -s.d - 1 - k * 4);
      this.fishJump.mesh.rotation.z = -k * Math.PI * 2;
      if (k === 1) { this.fishJump.mesh.rotation.z = 0; this.fishJump = null; }
    }
    if (this.flame) this.flame.scale.y = 1 + Math.sin(time * 13) * .2;
    this.updateFishing(s, dt, leader, friend, moving);
    this.effects = this.effects.filter(e => {
      e.life -= dt;
      if (e.life <= 0) { this.root.remove(e.obj); return false; }
      if (e.type === 'bubble') { e.obj.position.lerpVectors(e.from, e.to, 1 - e.life / e.max); e.obj.scale.setScalar(.45 + (1 - e.life / e.max) * .5); }
      else { e.vy -= 9 * dt; e.obj.position.x += e.vx * dt; e.obj.position.y += e.vy * dt; e.obj.position.z += e.vz * dt; e.obj.rotation.z += dt * 4; }
      return true;
    });
    const mobile = this.camera.aspect < 1;
    const showcase = this.preview || party;
    const fishingFocus = fish && s.fish.phase !== 'idle';
    const center = this.center.set(showcase && !mobile ? -5.5 : fishingFocus ? s.x + .8 : s.x * .4, 1.5, party ? 1.5 : -s.d - 2.5);
    this.follow.lerp(center, dt ? 1 - Math.exp(-dt * 5) : 1);
    // Mesmo campo horizontal em retrato: os obstáculos continuam visíveis.
    const desiredDistance = mobile ? fishingFocus ? 20 : 25 : showcase ? 23 : fishingFocus ? 14 : 20;
    this.viewDistance += (desiredDistance - this.viewDistance) * (dt ? 1 - Math.exp(-dt * 3) : 1);
    const dist = this.viewDistance;
    const yaw = showcase ? -.1 : this.yaw;
    const pitch = showcase ? .3 : this.pitch;
    this.camera.position.set(this.follow.x + Math.sin(yaw) * dist * Math.cos(pitch), this.follow.y + Math.sin(pitch) * dist,
      this.follow.z + Math.cos(yaw) * dist * Math.cos(pitch));
    if (showcase && mobile) this.camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * .19, innerWidth, innerHeight);
    else this.camera.clearViewOffset();
    this.camera.lookAt(this.follow);
    this.sky.position.copy(this.camera.position);
    this.sun.position.set(s.x - 14, 25, -s.d + 12); this.sun.target.position.set(s.x, 0, -s.d);
    this.updateAnimationBatches();
    this.renderer.render(this.scene, this.camera);
  }
  projectTarget(s) {
    const target = s.stage.type === 'fish' ? s.fishingSpots.find(p => p.caught < p.quota) : s.targets.find(t => !t.hit);
    if (!target) return null;
    this.project.set(target.x, 3.8, -target.d).project(this.camera);
    return { x: (this.project.x + 1) * innerWidth / 2, y: (1 - this.project.y) * innerHeight / 2, visible: this.project.z < 1 };
  }
}
