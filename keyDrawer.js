class KeyDrawer {
  constructor(context, coordinates) {
    this.context = context;
    this.coordinates = coordinates;
    this.activeKeys = new Set();
  }

  draw() {
    drawCircle(this.context, this.coordinates, 5, "RED");
  }

  erase() {
    drawCircle(this.context, this.coordinates, 6, "WHITE");
  }

  press(key) {
    if (this.activeKeys.size == 0) {
      this.draw();
    }
    this.activeKeys.add(key);
  }

  release(key) {
    this.activeKeys.delete(key);
    if (this.activeKeys.size == 0) {
      this.erase();
    }
  }
}
