import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTimerSound } from '../src/utils/timerSound.js';

function fixture() {
  const oscillators = [], gains = [];
  let context;
  class Context {
    state = 'running'; currentTime = 10; sampleRate = 44100; destination = {};
    constructor() { context = this; }
    resume() { return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    createBuffer() { return {}; }
    createBufferSource() { return { connect() {}, start() {} }; }
    createOscillator() {
      const node = { frequency: {}, starts: [], stops: [], disconnected: false,
        connect() {}, start(at) { this.starts.push(at); }, stop(at) { this.stops.push(at); }, disconnect() { this.disconnected = true; } };
      oscillators.push(node); return node;
    }
    createGain() {
      const node = { disconnected: false, points: [], connect() {}, disconnect() { this.disconnected = true; } };
      node.gain = { setValueAtTime(value, at) { node.points.push([value, at]); }, linearRampToValueAtTime(value, at) { node.points.push([value, at]); } };
      gains.push(node); return node;
    }
  }
  const sound = createTimerSound(() => Context, () => ({}));
  return { sound, oscillators, gains, get context() { return context; } };
}

test('correct answer has a short, soft ascending chime; skip has a distinct descending tone', () => {
  const f = fixture(); f.sound.unlock(); f.sound.feedback('correct');
  assert.deepEqual(f.oscillators.map(node => node.frequency.value), [523.25, 659.25, 783.99]);
  assert(f.oscillators.every(node => node.type === 'sine'));
  assert(f.gains.every(node => node.points[0][0] === 0 && node.points.at(-1)[0] === 0 && Math.max(...node.points.map(point => point[0])) <= .075));
  assert(f.oscillators.at(-1).stops[0] - 10 < .35);
  f.sound.feedback('skip');
  assert.deepEqual(f.oscillators.slice(3).map(node => node.frequency.value), [293.66, 220]);
  assert(f.oscillators.slice(3).every(node => node.type === 'triangle'));
  assert(f.gains.slice(3).every(node => Math.max(...node.points.map(point => point[0])) <= .055));
  f.sound.dispose();
});

test('new answers cancel previous tones instead of accumulating sound', () => {
  const f = fixture(); f.sound.unlock(); f.sound.feedback('correct');
  f.sound.feedback('skip');
  assert(f.oscillators.slice(0, 3).every(node => node.disconnected && node.stops.length === 2));
  assert(f.gains.slice(0, 3).every(node => node.disconnected));
  assert(f.oscillators.slice(3).every(node => !node.disconnected));
  f.sound.dispose();
  assert(f.oscillators.every(node => node.disconnected));
  assert(f.gains.every(node => node.disconnected));
});

test('feedback is silent before a gesture, for invalid outcomes and after disposal', () => {
  const f = fixture(); f.sound.feedback('correct'); assert.equal(f.context, undefined);
  f.sound.unlock(); f.sound.feedback('unknown'); assert.equal(f.oscillators.length, 0);
  f.sound.dispose(); f.sound.feedback('correct'); assert.equal(f.oscillators.length, 0);
});

test('only the latest feedback plays after a suspended audio context resumes', async () => {
  const f = fixture(); f.sound.unlock(); f.context.state = 'suspended';
  const resumes = []; f.context.resume = () => new Promise(resolve => resumes.push(resolve));
  f.sound.feedback('correct'); f.sound.feedback('skip');
  assert.equal(f.oscillators.length, 0);
  f.context.state = 'running'; resumes.forEach(resolve => resolve()); await Promise.resolve();
  assert.deepEqual(f.oscillators.map(node => node.frequency.value), [293.66, 220]);
  f.sound.dispose();
});

test('the timer alarm stops feedback and cancels delayed feedback', async () => {
  const f = fixture(); f.sound.unlock(); f.sound.feedback('correct'); f.sound.announce('Time is up', 'en');
  assert(f.oscillators.slice(0, 3).every(node => node.disconnected));
  assert.deepEqual(f.oscillators.slice(3).map(node => node.frequency.value), [880, 880, 880]);
  f.context.state = 'suspended'; let resume;
  f.context.resume = () => new Promise(resolve => { resume = resolve; });
  f.sound.feedback('skip'); f.sound.announce('Time is up', 'en');
  f.context.state = 'running'; resume(); await Promise.resolve();
  assert.equal(f.oscillators.length, 6);
  f.sound.dispose();
});

test('finished feedback nodes release themselves without being stopped again on disposal', () => {
  const f = fixture(); f.sound.unlock(); f.sound.feedback('correct');
  for (const node of f.oscillators) node.onended();
  f.sound.dispose();
  assert(f.oscillators.every(node => node.disconnected && node.stops.length === 1));
});

test('unavailable or failing audio never interrupts the game', () => {
  const absent = createTimerSound(() => undefined, () => ({}));
  assert.doesNotThrow(() => { absent.unlock(); absent.feedback('correct'); absent.feedback('skip'); absent.dispose(); });
  const f = fixture(); f.sound.unlock(); f.context.createGain = () => { throw new Error('Audio device lost'); };
  assert.doesNotThrow(() => { f.sound.feedback('correct'); f.sound.dispose(); });
});
