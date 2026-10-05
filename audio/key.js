const NOTE_GAIN = 0.05;               // per-note volume, before the master gain
const ATTACK_TIME_CONSTANT = 0.05;    // seconds (exponential approach)
const RELEASE_TIME_CONSTANT = 0.03;   // seconds (exponential approach)

/**
 * One playable note. Its oscillator runs all the time, and pressing or
 * releasing the key only ramps the gain up or down.
 *
 * `listener` is any object with press(key) and release(key) methods, which are
 * called after the sound starts and stops (script.js passes a KeyDrawer). This
 * is the only link from the sound code to the outside world.
 */
class Key {
  constructor(context, oscillator, gainNode, listener) {
    this.context = context;
    this.oscillator = oscillator;
    this.gainNode = gainNode;
    this.listener = listener;
  }

  press() {
    this.gainNode.gain.value = 0.0;
    this.gainNode.gain.setTargetAtTime(NOTE_GAIN, this.context.currentTime, ATTACK_TIME_CONSTANT);
    this.listener.press(this);
  }

  release() {
    this.gainNode.gain.setTargetAtTime(0, this.context.currentTime, RELEASE_TIME_CONSTANT);
    this.listener.release(this);
  }

  /** Multiplies the pitch, e.g. by 2 to go up an octave. */
  changeFrequency(factor) {
    this.oscillator.frequency.value *= factor;
  }
}

/** Creates a Key whose oscillator is started and wired to a silent gain node. */
function createKey(context, frequency, waveType, listener) {
  const oscillator = createOscillator(context, frequency, waveType);
  const gainNode = createGainNode(context);
  oscillator.connect(gainNode);
  oscillator.start(0);
  return new Key(context, oscillator, gainNode, listener);
}
