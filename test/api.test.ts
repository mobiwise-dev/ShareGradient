import { createShareGradient } from "../src/sharegradient";
import { ShareGradientBuilder } from "../src/api/ShareGradientBuilder";
import { expect, test, vi } from "vitest";

test("types are happy and API works", () => {
  const c = createShareGradient().setColors(["#000"]).setFPS(10).setResolution(0.3).setAngle(45).setOrigin(0.2, 0.8).setRotationSpeed(0.01).build();

  expect(c).toBeDefined();

  // Test fluent methods
  c.start();
  c.pause();
  c.resume();
  c.once();
  c.stop();
});

test("builder sanitizes invalid values and preserves a usable configuration", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const root = document.createElement("div");

  createShareGradient()
    .setCssVariable("demo-gradient")
    .setColors(["", "  ", "#123456"] as unknown as string[])
    .setFPS(-10)
    .setResolution(5)
    .setQuality(-1)
    .setOrigin(-5, 3)
    .setRoot({} as HTMLElement)
    .setRoot(root)
    .build()
    .once();

  expect(root.style.getPropertyValue("--demo-gradient")).toMatch(/^url\(/);
  expect(warnSpy).toHaveBeenCalled();

  warnSpy.mockRestore();
});

test("builder falls back to default colors when none are provided", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const root = document.createElement("div");

  createShareGradient().setCssVariable("--fallback-grad").setRoot(root).build().once();

  expect(root.style.getPropertyValue("--fallback-grad")).toMatch(/^url\(/);
  expect(warnSpy).toHaveBeenCalledWith("ShareGradient: No colors provided, using default fallback.");

  warnSpy.mockRestore();
});

test("builder setters update options and keep a fluent API", () => {
  const builder = new ShareGradientBuilder();
  const root = document.createElement("div");

  expect(builder.setVariable("alias-grad")).toBe(builder);
  expect(builder.setUpdateInterval(42)).toBe(builder);
  expect(builder.setGradientType("conic")).toBe(builder);
  expect(builder.setAnimationMode("rotate")).toBe(builder);
  expect(builder.setRotationSpeed(0.25)).toBe(builder);
  expect(builder.setRoot(root)).toBe(builder);

  const options = (builder as any).options;

  expect(options.cssVariable).toBe("--alias-grad");
  expect(options.updateInterval).toBe(42);
  expect(options.type).toBe("conic");
  expect(options.animationMode).toBe("rotate");
  expect(options.rotationSpeed).toBe(0.25);
  expect(options.root).toBe(root);
});
