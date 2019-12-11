class Coordinates {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(coordinates) {
    return new Coordinates(
      this.x + coordinates.x,
      this.y + coordinates.y
    );
  }

  subtract(coordinates) {
    return new Coordinates(
      this.x - coordinates.x,
      this.y - coordinates.y
    );
  }
}
