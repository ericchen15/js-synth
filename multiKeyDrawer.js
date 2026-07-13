class MultiKeyDrawer {
  constructor(context, nodes) {
    this.context = context;
    this.nodes = nodes;
    this.activeKeys = new Set();
  }

  draw() {
    this.nodes.forEach(item => {
      drawCircle(this.context, item.coordinates, 12, "YELLOW");
      writeText(this.context, item.coordinates, "12px Arial", "RED", item.label);
    });
  }

  erase() {
    this.nodes.forEach(item => {
      drawCircle(this.context, item.coordinates, 12, "WHITE");
      writeText(this.context, item.coordinates, "12px Arial", "RED", item.label);
    });
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