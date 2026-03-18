import { Controller } from "../core/Controller";
import { ShareGradientOptions, GradientType, AnimationMode } from "../core/types";

export class ShareGradientBuilder {
  private options: ShareGradientOptions = {
    colors: [],
    cssVariable: "--grad",
    updateInterval: 200,
    resolution: 0.5,
    quality: 0.75,
    type: "linear",
  };

  private warn(message: string) {
    console.warn(`ShareGradient: ${message}`);
  }

  private clampNumber(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
  }

  public setColors(colors: string[]): this {
    if (!Array.isArray(colors)) {
      this.warn("'setColors' expects an array of CSS color strings.");
      return this;
    }

    const nextColors = colors.filter((color): color is string => typeof color === "string" && color.trim().length > 0);

    if (nextColors.length === 0) {
      this.warn("'setColors' received no usable colors.");
      this.options.colors = [];
      return this;
    }

    this.options.colors = nextColors;
    return this;
  }

  public setCssVariable(name: string): this {
    if (typeof name !== "string" || name.trim().length === 0) {
      this.warn("'setCssVariable' expects a non-empty CSS variable name.");
      return this;
    }

    const normalizedName = name.trim().startsWith("--") ? name.trim() : `--${name.trim()}`;
    this.options.cssVariable = normalizedName;
    return this;
  }

  /**
   * Alias for setCssVariable.
   * Sets the CSS variable name where the gradient data URL will be stored.
   * @param name - The CSS variable name (e.g., "--my-gradient")
   */
  public setVariable(name: string): this {
    return this.setCssVariable(name);
  }

  public setUpdateInterval(ms: number): this {
    if (!this.isFiniteNumber(ms) || ms < 0) {
      this.warn("'setUpdateInterval' expects a number greater than or equal to 0.");
      return this;
    }

    this.options.updateInterval = ms;
    return this;
  }

  public setFPS(fps: number): this {
    if (!this.isFiniteNumber(fps) || fps <= 0) {
      this.warn("'setFPS' expects a number greater than 0.");
      return this;
    }

    this.options.updateInterval = Math.max(16, 1000 / fps);
    return this;
  }

  public setResolution(factor: number): this {
    if (!this.isFiniteNumber(factor)) {
      this.warn("'setResolution' expects a finite number.");
      return this;
    }

    this.options.resolution = this.clampNumber(factor, 0.1, 1);
    return this;
  }

  public setRoot(element: HTMLElement): this {
    if (!element || typeof element.style?.setProperty !== "function") {
      this.warn("'setRoot' expects an HTMLElement with a writable style property.");
      return this;
    }

    this.options.root = element;
    return this;
  }

  public setQuality(q: number): this {
    if (!this.isFiniteNumber(q)) {
      this.warn("'setQuality' expects a finite number.");
      return this;
    }

    this.options.quality = this.clampNumber(q, 0, 1);
    return this;
  }

  public setGradientType(type: GradientType): this {
    this.options.type = type;
    return this;
  }

  public setAngle(degrees: number): this {
    if (!this.isFiniteNumber(degrees)) {
      this.warn("'setAngle' expects a finite number.");
      return this;
    }

    this.options.angle = degrees;
    return this;
  }

  public setRotationSpeed(speed: number): this {
    if (!this.isFiniteNumber(speed)) {
      this.warn("'setRotationSpeed' expects a finite number.");
      return this;
    }

    this.options.rotationSpeed = speed;
    return this;
  }

  public setAnimationMode(mode: AnimationMode): this {
    this.options.animationMode = mode;
    return this;
  }

  public setOrigin(x: number, y: number): this {
    if (!this.isFiniteNumber(x) || !this.isFiniteNumber(y)) {
      this.warn("'setOrigin' expects two finite numbers.");
      return this;
    }

    this.options.origin = [this.clampNumber(x, 0, 1), this.clampNumber(y, 0, 1)];
    return this;
  }

  public build(): Controller {
    if (this.options.colors.length === 0) {
      this.warn("No colors provided, using default fallback.");
      this.options.colors = ["#000", "#fff"];
    }
    return new Controller(this.options);
  }
}

export const createShareGradient = () => new ShareGradientBuilder();
