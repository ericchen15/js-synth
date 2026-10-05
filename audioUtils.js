// Thin factories over the Web Audio API.

/** Creates an (unstarted) oscillator. `type` is an OscillatorNode type, e.g. "sawtooth". */
function createOscillator(context, frequency, type) {
  const oscillator = context.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  return oscillator;
}

/** Creates a gain node that starts silent (gain 0). */
function createGainNode(context) {
  const gainNode = context.createGain();
  gainNode.gain.value = 0;
  return gainNode;
}

/** Creates a biquad filter, e.g. createFilter(ctx, "lowpass", 6000). */
function createFilter(context, type, frequency) {
  const filter = context.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  return filter;
}
