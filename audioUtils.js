function createOscillator(context, frequency, type) {
  const oscillator = context.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  return oscillator;
}

function createGainNode(context) {
  const gainNode = context.createGain();
  gainNode.gain.value = 0;
  return gainNode;
}

function createFilter(context, type, frequency) {
  const filter = context.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  return filter;
}
