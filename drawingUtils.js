function drawLine(context, point1, point2, color) {
  context.strokeStyle = color;
  context.moveTo(point1[0], point1[1]);
  context.lineTo(point2[0], point2[1]);
  context.stroke();
}

function drawCircle(context, x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.closePath();
  context.fill();
}
