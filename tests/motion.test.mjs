import test from 'node:test';
import assert from 'node:assert/strict';
import { girlPose, dogPose } from '../aventura/motion.js';
test('meninas têm ritmos, amplitudes, balanço e olhar diferentes', () => {
  for (const time of [.4, 1.3, 3.5]) {
    const a = girlPose('julia', time, true), b = girlPose('nina', time, true);
    assert.notDeepEqual(a.limbs, b.limbs); assert.notEqual(a.bob, b.bob); assert.notEqual(a.sway, b.sway);
  }
});
test('cada cão tem comportamento característico e nomes intermitentes sem poluir a tela', () => {
  const activities = Array.from({ length: 5 }, () => new Set());
  for (let i = 0; i < 400; i++) {
    const t = i * .1, poses = Array.from({ length: 5 }, (_, dog) => dogPose(dog, t, false));
    poses.forEach((p, dog) => activities[dog].add(p.activity));
    assert.ok(poses.filter(p => p.showName).length <= 1);
  }
  ['sniff', 'hop', 'scout', 'play', 'sit'].forEach((name, i) => assert.ok(activities[i].has(name)));
});
