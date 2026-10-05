/** A labeled point on the canvas. */
class NoteNode {
  constructor(coordinates, label) {
    this.coordinates = coordinates;
    this.label = label;
  }
}

const NODE_RADIUS = 12;
const NODE_FONT = "12px Arial";
const NODE_LABEL_COLOR = "RED";
const NODE_ACTIVE_COLOR = "YELLOW";
const NODE_INACTIVE_COLOR = "WHITE";

/**
 * Draws the on-screen node(s) for one scale degree, which light up while any
 * key playing that degree is held. Several keys (the same degree in different
 * octaves) share one KeyDrawer, so it stays lit until all of them are
 * released. A degree can have several nodes (e.g. one pitch shown in several
 * places on the Tonnetz).
 */
class KeyDrawer {
  constructor(context, nodes) {
    this.context = context;
    this.nodes = nodes;
    this.activeKeys = new Set();
  }

  draw() {
    this.drawNodes(NODE_ACTIVE_COLOR);
  }

  erase() {
    this.drawNodes(NODE_INACTIVE_COLOR);
  }

  drawNodes(fillColor) {
    this.nodes.forEach(node => {
      drawCircle(this.context, node.coordinates, NODE_RADIUS, fillColor);
      writeText(this.context, node.coordinates, NODE_FONT, NODE_LABEL_COLOR, node.label);
    });
  }

  /** Forgets all pressed keys and draws the nodes unlit. */
  reset() {
    this.activeKeys.clear();
    this.erase();
  }

  press(key) {
    if (this.activeKeys.size === 0) {
      this.draw();
    }
    this.activeKeys.add(key);
  }

  release(key) {
    this.activeKeys.delete(key);
    if (this.activeKeys.size === 0) {
      this.erase();
    }
  }
}
