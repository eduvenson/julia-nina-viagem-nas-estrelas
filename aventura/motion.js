// Perfis determinísticos: mesma intenção, personalidades e ritmos diferentes.
export function girlPose(name, time, moving, airborne = false, skating = false) {
  const nina = name === 'nina';
  const phase = time * (nina ? 10.7 : 9.3) + (nina ? 1.1 : 0);
  const stride = (skating ? .26 : nina ? .62 : .47) * (moving ? 1 : 0);
  return {
    limbs: [Math.sin(phase) * stride, -Math.sin(phase) * stride * .9,
      -Math.sin(phase) * stride * .85, Math.sin(phase) * stride],
    bob: moving ? Math.abs(Math.sin(phase)) * (nina ? .11 : .055) : Math.sin(time * 2.1) * .015,
    lean: airborne ? -.12 : moving ? (nina ? -.09 : -.045) : 0,
    sway: moving ? Math.sin(phase) * (nina ? .045 : .025) : Math.sin(time * .7 + (nina ? 2 : 0)) * .025,
    head: moving ? Math.sin(phase / 2) * .06 : Math.sin(time * (nina ? .65 : .45) + (nina ? 1 : 0)) * .22,
    armOut: airborne ? .5 : nina ? .12 : .055
  };
}
export const DOG_PERSONALITIES = ['explorer', 'hopper', 'scout', 'playful', 'gentle'];
export function dogPose(index, time, moving, called = false, celebrating = false) {
  const phase = (time + index * 2.7) % 17;
  let activity = moving ? 'follow' : 'watch';
  if (called) activity = 'greet';
  else if (index === 0 && phase < 3) activity = 'sniff';
  else if (index === 1 && phase < 3.2) activity = 'hop';
  else if (index === 2 && phase < 3.4) activity = 'scout';
  else if (index === 3 && phase < 3) activity = 'play';
  else if (index === 4 && !moving && phase < 4.5) activity = 'sit';
  if (celebrating) activity = ['bow', 'roll', 'spin', 'hop', 'wave'][index];
  const gait = time * (8 + index * 1.1) + index * 1.7;
  return { activity, roll: activity === 'roll' ? Math.sin(time * 5) * 2.6 : 0, bow: activity === 'bow' ? .4 : 0,
    x: Math.sin(time * .8 + index * 2) * (activity === 'scout' ? 1.7 : activity === 'play' ? .9 : .35),
    lag: activity === 'sniff' ? 1.8 : activity === 'scout' ? -1.5 : index % 2 * .9,
    hop: ['hop', 'greet', 'play', 'wave'].includes(activity) ? Math.max(0, Math.sin(time * 7 + index)) * .55 : moving ? Math.abs(Math.sin(gait)) * .055 : 0,
    pitch: activity === 'sniff' ? .5 : activity === 'sit' ? -.18 : 0,
    spin: activity === 'spin' ? time * 5 : activity === 'play' ? Math.sin(time * 2) * 1.2 : activity === 'scout' ? Math.sin(time) * .3 : 0,
    tail: Math.sin(time * (activity === 'greet' ? 15 : 6 + index)) * (activity === 'sit' ? .2 : .65),
    legs: [0, Math.PI, Math.PI, 0].map(offset => moving || ['hop', 'play', 'greet'].includes(activity) ? Math.sin(gait + offset) * .48 : 0),
    showName: called ? Math.floor(time * 1.5) % 5 === index : Math.floor(time / 3.5) % 5 === index && time % 3.5 < 2.2
  };
}
