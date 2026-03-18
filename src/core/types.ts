export type GradientType = "linear" | "radial" | "conic";
export type AnimationMode = "static" | "swirl" | "rotate";

export interface ShareGradientOptions {
  /** Array of colors for the gradient (e.g. ['#f00', 'blue', 'oklch(...)']) */
  colors: string[];
  /** Name of the CSS variable to inject (e.g. '--grad') */
  cssVariable: string;
  /** Update interval in ms. Defaults to 200ms. */
  updateInterval: number;
  /** Pixel density factor. Defaults to 0.5. Renamed from density. */
  resolution: number;
  /** Target element to inject the variable. Defaults to document.documentElement. */
  root?: HTMLElement;
  /** Quality of the generated image (0 to 1). Defaults to 0.75. */
  quality?: number;
  /** Type of gradient. Defaults to 'linear'. */
  type?: GradientType;
  /** Angle in degrees. */
  angle?: number;
  /** Origin [x, y] relative to canvas (0-1). Defaults to [0.5, 0.5] (center). */
  origin?: [number, number];
  /** Rotation speed (radians per frame, approx). Defaults to 0 for static, 0.002 for default swirl. */
  rotationSpeed?: number;
  /** Animation mode. Defaults to 'static' or 'swirl' depending on context. */
  animationMode?: AnimationMode;
}
