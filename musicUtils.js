function centsToRatio(cents) {
  return Math.pow(2, cents / 1200);
}

function ratioToCents(ratio) {
  return Math.log2(ratio) * 1200;
}

function normalizeRatio(ratio, periodRatio) {
  if (ratio < 1) {
    while (ratio < 1) {
      ratio *= periodRatio;
    }
  } else if (ratio > periodRatio) {
    while (ratio > periodRatio) {
      ratio /= periodRatio;
    }
  }
  return ratio;
}

function calculateFrequency(scale, baseFrequency, offset) {
  const scaleLength = scale.length;
  const periodRatio = scale[scale.length - 1];
  const periodsAboveBase = Math.floor(offset / scale.length);
  const index = offset.mod(scale.length);
  const periodMultiplier = Math.pow(periodRatio, periodsAboveBase);
  var scaleMultiplier = 1;
  if (index > 0) {
    scaleMultiplier = scale[index - 1];
  }
  return baseFrequency * periodMultiplier * scaleMultiplier;
}

function createEtScale(periodRatio, numTones) {
  const EtScale = range(numTones).map(
    i => Math.pow(periodRatio, i / numTones)
  ).sort();
  EtScale.shift();
  EtScale.push(periodRatio);
  return EtScale;
}

function createEdoScale(periodRatio, numTones, degrees) {
  return createEtScale(periodRatio, numTones).filter(
    ((x, i) => degrees.includes(i + 1))
  );
}

function createGeneratorScale(periodRatio, generatorRatio, numTones, positionOfRoot) {
  const generatorScale = range(numTones).map(
    i => normalizeRatio(Math.pow(generatorRatio, i - positionOfRoot), periodRatio)
  ).sort();
  generatorScale.shift();
  generatorScale.push(periodRatio);
  return generatorScale;
}
