import "@testing-library/react";
import "@testing-library/jest-dom";

// jsdom has no canvas; return null like a browser without 2D support, instead
// of jsdom's noisy "not implemented" error (the tab favicon is canvas-drawn).
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
}
