export class InputHandler {
  constructor({ onModeChange, onAxisChange, onDelete, onFrame, onUndo, onRedo }) {
    this.onModeChange = onModeChange;
    this.onAxisChange = onAxisChange;
    this.onDelete = onDelete;
    this.onFrame = onFrame;
    this.onUndo = onUndo;
    this.onRedo = onRedo;
    this.axisConstraint = null;
    window.addEventListener("keydown", (event) => this.handleKey(event));
  }

  handleKey(event) {
    if (event.key === "g" || event.key === "G") {
      this.onModeChange?.("move");
    }
    if (event.key === "r" || event.key === "R") {
      this.onModeChange?.("rotate");
    }
    if (event.key === "s" || event.key === "S") {
      this.onModeChange?.("scale");
    }
    if (event.key === "x" || event.key === "X") {
      this.axisConstraint = "x";
      this.onAxisChange?.("x");
    }
    if (event.key === "y" || event.key === "Y") {
      this.axisConstraint = "y";
      this.onAxisChange?.("y");
    }
    if (event.key === "z" || event.key === "Z") {
      this.axisConstraint = "z";
      this.onAxisChange?.("z");
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      this.onDelete?.();
    }
    if (event.key === "f" || event.key === "F") {
      this.onFrame?.();
    }
    if (event.ctrlKey && event.key.toLowerCase() === "z" && event.shiftKey) {
      event.preventDefault();
      this.onRedo?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      this.onUndo?.();
    }
  }
}
