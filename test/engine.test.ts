// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { Engine } from "../src/core/Engine";

// Mock Canvas and Context
const mockContext = {
  clearRect: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillRect: vi.fn(),
  setTransform: vi.fn(),
  fillStyle: "",
};

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  toDataURL: vi.fn((type, quality) => `data:${type};base64,mock`),
  width: 0,
  height: 0,
  style: {},
};

// Spy on document.createElement to return our mock
vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as any);

test("Engine should deep check options and skip redundant draws", () => {
  const engine = new Engine(0.5);
  engine.init();
  engine.resize();

  // First Draw
  engine.draw(["#000", "#fff"], { type: "linear" });
  expect(mockContext.fillRect).toHaveBeenCalledTimes(1);

  // Prime the cache (simulating the render loop)
  engine.getSnapshot();

  // Redundant Draw (Same options)
  engine.draw(["#000", "#fff"], { type: "linear" });
  expect(mockContext.fillRect).toHaveBeenCalledTimes(1); // Should still be 1, because cache hit

  // Different Options
  engine.draw(["#000", "#fff"], { type: "radial" });
  expect(mockContext.fillRect).toHaveBeenCalledTimes(2);
});

test("Engine should cache snapshots", () => {
  const engine = new Engine(0.5);
  engine.init();
  engine.resize();

  // Force a successful draw to ensure we have a "lastURL" candidates
  // Mock toDataURL is tricky because invalidation clears lastURL.
  // We need to ensure draw -> invalidate -> getSnapshot populates lastURL.

  engine.draw(["#000"], {});

  // Reset mocks to ignore init() calls (checkWebPSupport usage)
  vi.clearAllMocks();

  const url1 = engine.getSnapshot(0.75);
  const url2 = engine.getSnapshot(0.75);

  expect(url1).toBe(url2);
  expect(mockCanvas.toDataURL).toHaveBeenCalledTimes(1);

  // Change quality -> cache miss
  engine.getSnapshot(0.5);
  expect(mockCanvas.toDataURL).toHaveBeenCalledTimes(2);
});

test("Engine should fallback to linear gradient when conic gradients are unsupported", () => {
  const engine = new Engine(0.5);
  engine.init();
  engine.resize();

  mockContext.createConicGradient = undefined as any;

  engine.draw(["#000", "#fff", "#000"], { type: "conic", animationMode: "rotate" });

  expect(mockContext.createLinearGradient).toHaveBeenCalled();
  expect(mockContext.fillRect).toHaveBeenCalled();
});
