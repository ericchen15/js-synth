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

function writeText(context, coordinates, font, color, text) {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, coordinates.x, coordinates.y)
}
