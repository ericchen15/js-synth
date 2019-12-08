Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
}

function dictFromArrays(keys, vals) {
  var result = {}
  keys.forEach((key, i) => result[key] = vals[i]);
  return result;
}

function range(size) {
  return [...Array(size).keys()];
}
