// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from "vitest";

const engineMocks = vi.hoisted(() => {
  return {
    init: vi.fn(),
    resize: vi.fn(),
    draw: vi.fn(),
    getSnapshot: vi.fn(() => "data:image/webp;base64,mock"),
    cleanup: vi.fn(),
  };
});

const injectVariableMock = vi.hoisted(() => vi.fn());

vi.mock("../src/core/Engine", () => {
  return {
    Engine: vi.fn(class MockEngine {
      constructor(_resolution?: number) {}
      init = engineMocks.init;
      resize = engineMocks.resize;
      draw = engineMocks.draw;
      getSnapshot = engineMocks.getSnapshot;
      cleanup = engineMocks.cleanup;
    }),
  };
});

vi.mock("../src/css/injectVariable", () => {
  return {
    injectVariable: injectVariableMock,
  };
});

import { Controller } from "../src/core/Controller";

describe("Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    let hidden = false;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hidden,
      set: (value: boolean) => {
        hidden = value;
      },
    });

    let rafId = 0;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        rafId += 1;
        return rafId;
      })
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const mediaQueryList = {
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn(() => mediaQueryList),
    });
  });

  test("start, pause, resume and stop manage engine and listeners", () => {
    const addWindowListenerSpy = vi.spyOn(window, "addEventListener");
    const removeWindowListenerSpy = vi.spyOn(window, "removeEventListener");
    const addDocumentListenerSpy = vi.spyOn(document, "addEventListener");
    const removeDocumentListenerSpy = vi.spyOn(document, "removeEventListener");

    const controller = new Controller({
      colors: ["#000", "#fff"],
      cssVariable: "--demo",
      updateInterval: 0,
      resolution: 0.5,
    });

    controller.start();
    controller.start();

    expect(engineMocks.init).toHaveBeenCalledTimes(1);
    expect(engineMocks.resize).toHaveBeenCalledTimes(1);
    expect(engineMocks.draw).toHaveBeenCalledTimes(1);
    expect(injectVariableMock).toHaveBeenCalledWith("--demo", "url(data:image/webp;base64,mock)", undefined);
    expect(addWindowListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(addDocumentListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));

    controller.pause();
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);

    controller.resume();
    expect(engineMocks.draw).toHaveBeenCalledTimes(2);

    controller.stop();
    expect(engineMocks.cleanup).toHaveBeenCalledTimes(1);
    expect(removeWindowListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(removeDocumentListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  test("resize handler debounces updates and once renders a single frame", () => {
    const controller = new Controller({
      colors: ["#111", "#222"],
      cssVariable: "--resize-demo",
      updateInterval: 200,
      resolution: 0.5,
    });

    controller.once();
    expect(engineMocks.init).toHaveBeenCalledTimes(1);
    expect(engineMocks.resize).toHaveBeenCalledTimes(1);
    expect(engineMocks.draw).toHaveBeenCalledTimes(1);

    controller.start();
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("resize"));

    expect(engineMocks.resize).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(99);
    expect(engineMocks.resize).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1);
    expect(engineMocks.resize).toHaveBeenCalledTimes(3);
    expect(engineMocks.draw).toHaveBeenCalledTimes(2);

    controller.stop();
  });

  test("visibility change pauses and resumes the animation loop", () => {
    let hidden = false;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hidden,
    });

    const controller = new Controller({
      colors: ["#111", "#eee"],
      cssVariable: "--visibility-demo",
      updateInterval: 0,
      resolution: 0.5,
    });

    controller.start();
    const drawCountAfterStart = engineMocks.draw.mock.calls.length;

    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(cancelAnimationFrame).toHaveBeenCalled();

    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(engineMocks.draw.mock.calls.length).toBeGreaterThan(drawCountAfterStart);

    controller.stop();
  });
});
