class GraphNode {
  constructor(context, coordinates, label) {
    this.context = context;
    this.coordinates = coordinates;
    this.label = label;
  }
}

function createTonnetzNodes(context) {
    return {
        "G♭": new GraphNode(context, new Coordinates(100, 625), "G\u{266D}"),
        "D♭": new GraphNode(context, new Coordinates(300, 625), "D\u{266D}"),
        "A♭": new GraphNode(context, new Coordinates(500, 625), "A\u{266D}"),
        "E♭": new GraphNode(context, new Coordinates(700, 625), "E\u{266D}"),
        "B♭": new GraphNode(context, new Coordinates(900, 625), "B\u{266D}"),
        "B♭-": new GraphNode(context, new Coordinates(200, 450), "B\u{266D}"),
        "F": new GraphNode(context, new Coordinates(400, 450), "F"),
        "C": new GraphNode(context, new Coordinates(600, 450), "C"),
        "G": new GraphNode(context, new Coordinates(800, 450), "G"),
        "D": new GraphNode(context, new Coordinates(1000, 450), "D"),
        "D-": new GraphNode(context, new Coordinates(300, 275), "D"),
        "A": new GraphNode(context, new Coordinates(500, 275), "A"),
        "E": new GraphNode(context, new Coordinates(700, 275), "E"),
        "B": new GraphNode(context, new Coordinates(900, 275), "B"),
        "F♯": new GraphNode(context, new Coordinates(1100, 275), "F\u{266F}"),
        "F♯-": new GraphNode(context, new Coordinates(400, 100), "F\u{266F}"),
        "C♯": new GraphNode(context, new Coordinates(600, 100), "C\u{266F}"),
        "G♯": new GraphNode(context, new Coordinates(800, 100), "G\u{266F}"),
        "D♯": new GraphNode(context, new Coordinates(1000, 100), "D\u{266F}"),
        "A♯": new GraphNode(context, new Coordinates(1200, 100), "A\u{266F}")
    };
}

const tet12NodeLists = [
    ["C♯", "D♭"],
    ["D", "D-"],
    ["D♯", "E♭"],
    ["E"],
    ["F"],
    ["F♯", "F♯-", "G♭"],
    ["G"],
    ["G♯", "A♭"],
    ["A"],
    ["A♯", "B♭", "B♭-"],
    ["B"],
    ["C"],
];