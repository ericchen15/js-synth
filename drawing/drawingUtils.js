// Canvas 2D drawing primitives.

/**
 * Strokes a line between two points.
 *
 * Note: this does not call beginPath(), so each call re-strokes every line
 * drawn since the last beginPath() (drawCircle starts a new path). The
 * repeated overdraw is what makes the grid lines render solid black; adding
 * beginPath() here would make them visibly lighter.
 */
function drawLine(context, coordinates1, coordinates2, color) {
  context.strokeStyle = color;
  context.moveTo(coordinates1.x, coordinates1.y);
  context.lineTo(coordinates2.x, coordinates2.y);
  context.stroke();
}

function drawCircle(context, coordinates, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(coordinates.x, coordinates.y, radius, 0, 2 * Math.PI);
  context.closePath();
  context.fill();
}

/** Draws text centered (horizontally and vertically) on the given point. */
function writeText(context, coordinates, font, color, text) {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, coordinates.x, coordinates.y);
}
