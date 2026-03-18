import { IS_BROWSER } from "../utils/env";
import { AnimationMode } from "./types";

export class Engine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width = 0;
  private height = 0;
  private t = 0;
  private supportsWebP = false;

  // Caching
  private lastURL = "";
  private lastQuality = -1;
  // Caching of options for deep equality check
  private lastOptionsKey: string = "";

  public cleanup() {
    this.canvas = null;
    this.ctx = null;
    this.lastURL = "";
    this.lastOptionsKey = "";
  }

  constructor(private resolution: number = 0.5) {
    // Lazy init: canvas is not created here anymore
  }

  public init() {
    if (this.canvas) return; // Already initialized
    if (IS_BROWSER) {
      this.initCanvas();
      this.checkWebPSupport();
    }
  }

  private initCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "-9999px";
    this.canvas.style.visibility = "hidden";

    this.ctx = this.canvas.getContext("2d", { alpha: false });
    if (!this.ctx) {
      console.error("ShareGradient: Failed to get 2D context");
    }
  }

  private checkWebPSupport() {
    if (!this.canvas) return;
    this.supportsWebP = this.canvas.toDataURL("image/webp").startsWith("data:image/webp");
  }

  public resize() {
    if (!this.canvas || !this.ctx || !IS_BROWSER) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.resolution * dpr;
    this.canvas.height = this.height * this.resolution * dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Invalidate cache on resize because dimensions changed
    this.lastURL = "";
    this.lastQuality = -1;
    // Force redraw next time
    this.lastOptionsKey = "";
  }

  public draw(colors: string[], options?: { type?: "linear" | "radial" | "conic"; angle?: number; origin?: [number, number]; rotationSpeed?: number; animationMode?: AnimationMode }) {
    if (!this.ctx || !this.canvas) return;

    // Manual key generation for performance and stability
    // Order: colors-type-angle-rotSpeed-mode-origin
    const key =
      colors.join("|") + "|" + (options?.type || "linear") + "|" + (options?.angle ?? "ni") + "|" + (options?.rotationSpeed ?? "ni") + "|" + (options?.animationMode ?? "ni") + "|" + (options?.origin ? options.origin.join(",") : "ni");

    const mode = options?.animationMode || (options?.rotationSpeed ? "rotate" : "static");
    const type = options?.type || "linear";

    // "Static" mode + same key = no redraw needed
    // But we need to handle the time 't' increment.
    // Ideally, if it's static, t doesn't change, so key is enough.
    // If it's animating, 'key' alone isn't enough because 't' changes state internally?
    // Actually our draw logic uses 'this.t'. If we don't draw, 't' doesn't increment.
    // So if options dictate animation, we MUST draw.
    // BUT checking key helps avoid re-calculating gradients if parameters didn't change?
    // NO, 't' is used IN the gradient calculation (rotationOffset).
    // So if animation is active, we basically ALWAYS verify visual change.

    // Optimization: If NOT animating, and key matches, return.
    const isAnimating = mode !== "static";

    // Wait, the user said: "Engine.draw() invalide le cache... même quand rien n'a changé".
    // If we are strictly equal (and static?), we return early.
    // If we are animating, we DO redraw.
    // BUT we should only invalidate 'lastURL' if we actually drew.

    if (!isAnimating && this.lastOptionsKey === key && this.lastURL) {
      return;
    }

    // Even if animating, if the visual output hasn't changed (e.g. paused t?), we might skip?
    // But t changes every frame loop in draw if we are here.

    this.lastOptionsKey = key;

    const w = this.canvas.width / Math.min(window.devicePixelRatio || 1, 2);
    const h = this.canvas.height / Math.min(window.devicePixelRatio || 1, 2);

    this.ctx.clearRect(0, 0, w, h);

    let g: CanvasGradient;
    let rotationOffset = 0;

    // Legacy/Default Fallback Logic
    const isDefaultSwirl = !options?.animationMode && type === "linear" && options?.angle === undefined && !options?.rotationSpeed;

    if (mode === "swirl" || isDefaultSwirl) {
      this.t += 0.002;
      rotationOffset = this.t * 0.5;
    } else if (mode === "rotate") {
      const speed = options?.rotationSpeed ?? 0.002;
      this.t += speed;
      rotationOffset = this.t;
    }

    if (type === "radial") {
      const ox = (options?.origin?.[0] ?? 0.5) * w;
      const oy = (options?.origin?.[1] ?? 0.5) * h;
      const r = Math.sqrt(Math.max(ox * ox + oy * oy, (w - ox) * (w - ox) + (h - oy) * (h - oy), (w - ox) * (w - ox) + oy * oy, ox * ox + (h - oy) * (h - oy)));
      g = this.ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
    } else if (type === "conic") {
      const ox = (options?.origin?.[0] ?? 0.5) * w;
      const oy = (options?.origin?.[1] ?? 0.5) * h;
      let startAngle = options?.angle ? (options.angle * Math.PI) / 180 : 0;
      startAngle += rotationOffset;

      if (this.ctx.createConicGradient) {
        g = this.ctx.createConicGradient(startAngle, ox, oy);
      } else {
        g = this.ctx.createLinearGradient(0, 0, w, h);
      }
    } else {
      // Linear
      let finalAngle = 0;
      if (options?.angle !== undefined) {
        finalAngle = ((options.angle - 90) * Math.PI) / 180;
      }

      if (mode === "rotate") {
        finalAngle += rotationOffset;
      }

      if (mode === "swirl" || isDefaultSwirl) {
        const angle = rotationOffset;
        const x = w * (0.5 + 0.5 * Math.cos(angle));
        const y = h * (0.5 + 0.5 * Math.sin(angle));
        g = this.ctx.createLinearGradient(0, 0, x, y);
      } else {
        const rad = finalAngle;
        const absCos = Math.abs(Math.cos(rad));
        const absSin = Math.abs(Math.sin(rad));
        const dist = (w * absCos + h * absSin) / 2;
        const cx = w / 2;
        const cy = h / 2;
        const x0 = cx - Math.cos(rad) * dist;
        const y0 = cy - Math.sin(rad) * dist;
        const x1 = cx + Math.cos(rad) * dist;
        const y1 = cy + Math.sin(rad) * dist;
        g = this.ctx.createLinearGradient(x0, y0, x1, y1);
      }
    }

    const len = colors.length;
    for (let i = 0; i < len; i++) {
      const c = colors[i];
      if (c) g.addColorStop(i / (len - 1), c);
    }

    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);

    // ONLY invalidate if we actually drew
    this.lastURL = "";
    this.lastQuality = -1;
  }

  public getSnapshot(quality: number = 0.75): string {
    if (!this.canvas) return "";

    // Cache check
    if (quality === this.lastQuality && this.lastURL) {
      return this.lastURL;
    }

    this.lastQuality = quality;
    this.lastURL = this.supportsWebP ? this.canvas.toDataURL("image/webp", quality) : this.canvas.toDataURL("image/jpeg", quality + 0.1);

    return this.lastURL;
  }
}
