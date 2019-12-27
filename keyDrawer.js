class KeyDrawer {
  constructor(context, coordinates, noteName) {
    this.context = context;
    this.coordinates = coordinates;
    this.noteName = noteName;
    this.activeKeys = new Set();
  }

  draw() {
    drawCircle(this.context, this.coordinates, 12, "YELLOW");
    writeText(this.context, this.coordinates, "12px Arial", "RED", this.noteName);
  }

  erase() {
    drawCircle(this.context, this.coordinates, 12, "WHITE");
    writeText(this.context, this.coordinates, "12px Arial", "RED", this.noteName);
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

function createDummyKeyDrawer(context) {
  return new KeyDrawer(
    context,
    new Coordinates(300, 300),
    ""
  )
}
