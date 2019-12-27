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
  const etScale = createEtScale(periodRatio, numTones);
  var edoScale = [];
  for (var i = 0; i < degrees.length; i++) {
    var currDegree = degrees[i] - 1;
    edoScale.push(etScale[currDegree]);
  }
  return edoScale;
}

function createGeneratorScale(periodRatio, generatorRatio, numTones, positionOfRoot) {
  const generatorScale = range(numTones).map(
    i => normalizeRatio(Math.pow(generatorRatio, i - positionOfRoot), periodRatio)
  ).sort();
  generatorScale.shift();
  generatorScale.push(periodRatio);
  return generatorScale;
}

function almostEqual(num1, num2) {
  return 0.9999 < num2 / num1 && num2 / num1 < 1.0001;
}

function findConsonance(note1, note2, periodRatio, consonances) {
  const intervalRatio = normalizeRatio(note2 / note1, periodRatio);
  for (var i = 0; i < consonances.length; i++) {
    var consonance = consonances[i];
    if (almostEqual(intervalRatio, consonance)) {
      return consonance;
    }
    var invertedConsonance = periodRatio / consonance;
    if (almostEqual(intervalRatio, invertedConsonance)) {
      return invertedConsonance;
    }
  }
  return 0;
}

function getCoordinatesIfPossible(
    scaleToCoordinates,
    basisRatios,
    basisDirections,
    note,
    periodRatio) {
  for (var [knownNote, knownCoordinates] of scaleToCoordinates) {
    var consonance = findConsonance(knownNote, note, periodRatio, basisRatios);
    var consonanceIndex = basisRatios.indexOf(consonance);
    if (consonanceIndex != -1) {
      return knownCoordinates.add(basisDirections[consonanceIndex]);
    }

    const invertedBasisRatios = basisRatios.map(ratio => periodRatio / ratio);
    consonanceIndex = invertedBasisRatios.indexOf(consonance);
    if (consonanceIndex != -1) {
      return knownCoordinates.subtract(basisDirections[consonanceIndex]);
    }
  }
  return null;
}

function getAllCoordinates(scale, basisRatios, rootCoordinates, basisDirections) {
  var scaleToCoordinates = new Map();
  const periodRatio = scale[scale.length - 1];
  scaleToCoordinates.set(periodRatio, rootCoordinates);

  while (scaleToCoordinates.size < scale.length) {
    for (var i = 0; i < scale.length; i++) {
      var note = scale[i];
      if (!scaleToCoordinates.has(note)) {
        var possibleCoordinates = getCoordinatesIfPossible(
          scaleToCoordinates, basisRatios, basisDirections, note, periodRatio
        );
        if (possibleCoordinates != null) {
          scaleToCoordinates.set(note, possibleCoordinates);
        }
      }
    }
  }

  return scaleToCoordinates;
}

function getAllConsonances(scale, consonances) {
  var allConsonances = [];
  const periodRatio = scale[scale.length - 1];

  for (var i = 0; i < scale.length - 1; i++) {
    var note1 = scale[i];
    for (var j = i + 1; j < scale.length; j++) {
      var note2 = scale[j];

      if (findConsonance(note1, note2, periodRatio, consonances) > 0) {
        allConsonances.push([note1, note2]);
      }
    }
  }
  return allConsonances;
}
