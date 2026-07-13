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

function drawGridLines(context, nodes, color = "BLACK") {
    const nodeList = Object.values(nodes);
    
    // Constants based on your grid spacing
    const SIDE_LENGTH = 200;
    const HEIGHT = 175;
    const TOLERANCE = 10; // Small buffer for floating point or rounding issues

    for (let i = 0; i < nodeList.length; i++) {
        for (let j = i + 1; j < nodeList.length; j++) {
            const nodeA = nodeList[i];
            const nodeB = nodeList[j];

            const dx = Math.abs(nodeA.coordinates.x - nodeB.coordinates.x);
            const dy = Math.abs(nodeA.coordinates.y - nodeB.coordinates.y);

            // 1. Horizontal Connection: dx is ~200, dy is ~0
            const isHorizontal = dy < TOLERANCE && Math.abs(dx - SIDE_LENGTH) < TOLERANCE;

            // 2. Diagonal Connection: dy is ~175, dx is ~100 (half side)
            const isDiagonal = Math.abs(dy - HEIGHT) < TOLERANCE && Math.abs(dx - (SIDE_LENGTH / 2)) < TOLERANCE;

            if (isHorizontal || isDiagonal) {
                drawLine(context, nodeA.coordinates, nodeB.coordinates, color);
            }
        }
    }
}
