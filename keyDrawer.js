class KeyDrawer {
  constructor(context, x, y) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.activeKeys = new Set();
  }

  draw() {
    drawCircle(this.context, this.x, this.y, 5, "RED");
  }

  erase() {
    drawCircle(this.context, this.x, this.y, 6, "WHITE");
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
