// The 12-TET Tonnetz used by the default visualization: a triangular grid of
// note names where
//   one step right       = up a perfect fifth
//   one step up-right    = up a major third
//   one step down-right  = up a minor third
//
// Some pitches appear in more than one place. When a name repeats, the extra
// copy's key gets a "-" suffix (e.g. "D-"), but it keeps the plain label.

const TONNETZ_COLUMN_SPACING = 200;  // px between neighbors in a row
const TONNETZ_ROW_HEIGHT = 175;      // px between rows
const TONNETZ_ORIGIN = new Coordinates(100, 625);  // the bottom-left node

// Rows from bottom to top. Each row starts half a column to the right of the
// row below it.
const TONNETZ_ROWS = [
  ["G♭", "D♭", "A♭", "E♭", "B♭"],
  ["B♭-", "F", "C", "G", "D"],
  ["D-", "A", "E", "B", "F♯"],
  ["F♯-", "C♯", "G♯", "D♯", "A♯"],
];

// Tonnetz nodes for each scale degree of tet12Scale. Entry d is scale[d], i.e.
// degree d + 1, so the list starts at C♯ and ends with the root C (see the
// scale format in musicUtils.js).
const TONNETZ_NODES_BY_DEGREE = [
  ["C♯", "D♭"],
  ["D", "D-"],
  ["D♯", "E♭"],
  ["E"],
  ["F"],
  ["F♯", "F♯-", "G♭"],
  ["G"],
  ["G♯", "A♭"],
  ["A"],
  ["A♯", "B♭", "B♭-"],
  ["B"],
  ["C"],
];

/** Returns {name: NoteNode} for every node in TONNETZ_ROWS. */
function createTonnetzNodes() {
  const nodes = {};
  TONNETZ_ROWS.forEach((row, rowIndex) => {
    row.forEach((name, columnIndex) => {
      const coordinates = new Coordinates(
        TONNETZ_ORIGIN.x + rowIndex * TONNETZ_COLUMN_SPACING / 2 + columnIndex * TONNETZ_COLUMN_SPACING,
        TONNETZ_ORIGIN.y - rowIndex * TONNETZ_ROW_HEIGHT
      );
      nodes[name] = new NoteNode(coordinates, name.replace(/-$/, ""));
    });
  });
  return nodes;
}

/**
 * Draws a line between every pair of neighboring nodes, i.e. pairs that are
 * one step apart in the same row or diagonally.
 */
function drawTonnetzGridLines(context, nodes, color = "BLACK") {
  const nodeList = Object.values(nodes);
  const TOLERANCE = 10;  // px

  for (let i = 0; i < nodeList.length; i++) {
    for (let j = i + 1; j < nodeList.length; j++) {
      const nodeA = nodeList[i];
      const nodeB = nodeList[j];

      const dx = Math.abs(nodeA.coordinates.x - nodeB.coordinates.x);
      const dy = Math.abs(nodeA.coordinates.y - nodeB.coordinates.y);

      const isHorizontal =
        dy < TOLERANCE && Math.abs(dx - TONNETZ_COLUMN_SPACING) < TOLERANCE;
      const isDiagonal =
        Math.abs(dy - TONNETZ_ROW_HEIGHT) < TOLERANCE &&
        Math.abs(dx - TONNETZ_COLUMN_SPACING / 2) < TOLERANCE;

      if (isHorizontal || isDiagonal) {
        drawLine(context, nodeA.coordinates, nodeB.coordinates, color);
      }
    }
  }
}
