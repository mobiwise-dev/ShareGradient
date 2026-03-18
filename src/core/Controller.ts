import { Engine } from "./Engine";
import { injectVariable } from "../css/injectVariable";
import { ShareGradientOptions } from "./types";
import { IS_BROWSER } from "../utils/env";

export class Controller {
  private engine: Engine;
  private rafId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  private options: ShareGradientOptions;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private mediaQueryList: MediaQueryList | null = null;
  private listenersAttached = false;

  constructor(options: ShareGradientOptions) {
    this.options = options;
    const safeOptions: ShareGradientOptions = {
      ...options,
      quality: options.quality ?? 0.75,
      type: options.type ?? "linear",
      updateInterval: options.updateInterval ?? 200,
      resolution: options.resolution ?? 0.5,
    };
    this.options = safeOptions;
    this.engine = new Engine(safeOptions.resolution);
  }

  public start() {
    if (!IS_BROWSER) return;
    if (this.isRunning) return;

    this.engine.init(); // Lazy init
    this.engine.resize();
    this.setupListeners();

    this.isRunning = true;
    this.lastTime = 0;
    this.loop(0);
  }

  public stop() {
    this.pause();
    this.removeListeners();
    this.engine.cleanup();
    this.lastTime = 0;
  }

  public pause() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public resume() {
    if (!IS_BROWSER || this.isRunning) return;
    this.isRunning = true;
    this.loop(performance.now());
  }

  public once() {
    if (!IS_BROWSER) return;
    this.engine.init();
    this.engine.resize();
    this.update();
  }

  private loop = (ts: number) => {
    if (!this.isRunning) return;

    // Throttling logic
    if (ts - this.lastTime >= this.options.updateInterval) {
      this.update();
      this.lastTime = ts;
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private update() {
    this.engine.draw(this.options.colors, this.options);
    const url = this.engine.getSnapshot(this.options.quality);
    if (url) {
      injectVariable(this.options.cssVariable, `url(${url})`, this.options.root);
    }
  }

  // Simple debounce without 'this' context issues
  private handleResize = (() => {
    return () => {
      if (this.resizeTimeout !== null) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.resizeTimeout = null;
        this.engine.resize();
        this.update();
      }, 100);
    };
  })();

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  private setupListeners() {
    if (this.listenersAttached) return;

    window.addEventListener("resize", this.handleResize);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // Optional: Pause on reduced motion
    if (window.matchMedia) {
      this.mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (typeof this.mediaQueryList.addEventListener === "function") {
        this.mediaQueryList.addEventListener("change", this.handleMotionPreference);
      } else if (typeof this.mediaQueryList.addListener === "function") {
        this.mediaQueryList.addListener(this.handleMotionPreference);
      }
    }

    this.listenersAttached = true;
  }

  private removeListeners() {
    if (!this.listenersAttached) return;

    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);

    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    if (this.mediaQueryList) {
      if (typeof this.mediaQueryList.removeEventListener === "function") {
        this.mediaQueryList.removeEventListener("change", this.handleMotionPreference);
      } else if (typeof this.mediaQueryList.removeListener === "function") {
        this.mediaQueryList.removeListener(this.handleMotionPreference);
      }
      this.mediaQueryList = null;
    }

    this.listenersAttached = false;
  }

  private handleMotionPreference = (_e: MediaQueryListEvent) => {
    // Left empty as before, logic handled by user CSS generally
  };
}
