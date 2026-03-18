# ShareGradient

Animated gradients for the browser, shared across your UI through a CSS custom property.

ShareGradient renders a gradient on a single canvas, converts it to an image URL, and injects that URL into a CSS variable such as `--hero-gradient`. You can then reuse the same gradient on backgrounds, text, borders, overlays, or anywhere else CSS accepts `background: var(--your-variable)`.

It is a small browser-focused TypeScript library with no runtime dependencies.

## What It Does

- Generates animated `linear`, `radial`, and `conic` gradients
- Exposes the result through a CSS variable
- Reuses one generated gradient across many elements
- Supports static, swirl, and rotation-based animation modes
- Handles resize and viewport changes automatically
- Lets you control rendering frequency, quality, and resolution

## Installation

```bash
npm install sharegradient
```

## Quick Start

Create a gradient and inject it into `--hero-gradient`:

```ts
import { createShareGradient } from "sharegradient";

const heroGradient = createShareGradient()
  .setColors([
    "oklch(0.62 0.22 330)",
    "oklch(0.78 0.16 80)",
    "oklch(0.54 0.19 270)",
  ])
  .setCssVariable("--hero-gradient")
  .setGradientType("linear")
  .setAnimationMode("swirl")
  .setResolution(0.5)
  .build();

heroGradient.start();
```

Then use it in CSS:

```css
.hero {
  background: var(--hero-gradient);
  background-size: cover;
}
```

## How It Works

1. ShareGradient draws a gradient into an internal canvas.
2. The canvas is exported as a data URL.
3. That data URL is written into the CSS variable you configured.
4. Any element using `background: var(--your-variable)` shares the same generated image.

This makes it easy to keep multiple UI areas visually synchronized without duplicating gradient logic in CSS.

## Complete Example

This example shows one shared gradient reused across a page background, a title, and a card border.

```ts
import { createShareGradient } from "sharegradient";

const sharedGradient = createShareGradient()
  .setColors(["#ff0f7b", "#f89b29", "#ff0f7b"])
  .setCssVariable("--shared-grad")
  .setGradientType("linear")
  .setAnimationMode("swirl")
  .setFPS(24)
  .setResolution(0.5)
  .setQuality(0.75)
  .build();

sharedGradient.start();
```

```css
body {
  background: var(--shared-grad);
  background-size: cover;
}

.title {
  background: var(--shared-grad);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.card {
  position: relative;
  background: #111;
}

.card::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  background: var(--shared-grad);
}
```

## Gradient Types

### Linear

```ts
createShareGradient()
  .setColors(["#00dbde", "#fc00ff"])
  .setCssVariable("--linear-grad")
  .setGradientType("linear")
  .setAngle(45)
  .build()
  .start();
```

### Radial

```ts
createShareGradient()
  .setColors(["#ffffff", "#7f5af0", "#16161a"])
  .setCssVariable("--radial-grad")
  .setGradientType("radial")
  .setOrigin(0.35, 0.4)
  .setAnimationMode("static")
  .build()
  .start();
```

### Conic

```ts
createShareGradient()
  .setColors(["cyan", "magenta", "yellow", "cyan"])
  .setCssVariable("--conic-grad")
  .setGradientType("conic")
  .setAnimationMode("rotate")
  .setRotationSpeed(0.03)
  .build()
  .start();
```

If `createConicGradient()` is not available in the current browser, ShareGradient falls back to a linear gradient instead of throwing. That keeps the page functional, but the visual result is intentionally less specific than a true conic render.

## Animation Modes

### Static

Renders the gradient without animation.

```ts
createShareGradient()
  .setColors(["#111", "#444"])
  .setCssVariable("--static-grad")
  .setAnimationMode("static")
  .build()
  .start();
```

### Swirl

Best suited for animated linear gradients with a fluid motion.

```ts
createShareGradient()
  .setColors(["#ff0080", "#7928ca", "#2afadf"])
  .setCssVariable("--swirl-grad")
  .setAnimationMode("swirl")
  .build()
  .start();
```

### Rotate

Useful for rotating linear or conic gradients.

```ts
createShareGradient()
  .setColors(["#00c6ff", "#0072ff"])
  .setCssVariable("--rotate-grad")
  .setGradientType("linear")
  .setAnimationMode("rotate")
  .setRotationSpeed(0.015)
  .build()
  .start();
```

## Runtime Controls

`build()` returns a controller with the following methods:

- `start()` starts the animation loop
- `pause()` pauses the loop
- `resume()` resumes a paused loop
- `once()` renders one frame without starting the loop
- `stop()` stops the loop and clears internal listeners

Example:

```ts
const gradient = createShareGradient()
  .setColors(["#000", "#fff"])
  .setCssVariable("--demo-grad")
  .build();

gradient.start();

setTimeout(() => gradient.pause(), 2000);
setTimeout(() => gradient.resume(), 4000);
setTimeout(() => gradient.stop(), 8000);
```

## API Reference

### Builder

`createShareGradient()` returns a `ShareGradientBuilder`.

| Method | Description | Default |
| --- | --- | --- |
| `setColors(colors)` | Sets the gradient color stops | `[]` |
| `setCssVariable(name)` | Sets the CSS variable name | `--grad` |
| `setVariable(name)` | Alias of `setCssVariable` | `--grad` |
| `setGradientType(type)` | `linear`, `radial`, or `conic` | `linear` |
| `setAngle(degrees)` | Sets the angle for linear and conic gradients | `0` |
| `setOrigin(x, y)` | Sets the origin as normalized coordinates | centered |
| `setAnimationMode(mode)` | `static`, `swirl`, or `rotate` | auto |
| `setRotationSpeed(speed)` | Sets rotation speed used by `rotate` mode | `0` |
| `setUpdateInterval(ms)` | Minimum delay between updates | `200` |
| `setFPS(fps)` | Convenience helper for update interval | `5` |
| `setResolution(factor)` | Rendering scale factor | `0.5` |
| `setQuality(quality)` | Output image quality from `0` to `1` | `0.75` |
| `setRoot(element)` | Injects the CSS variable on a specific element | `document.documentElement` |

### Types

```ts
type GradientType = "linear" | "radial" | "conic";
type AnimationMode = "static" | "swirl" | "rotate";
```

## Notes And Current Scope

- ShareGradient is designed for browser environments.
- The injected value is an image URL wrapped in `url(...)`, intended for CSS background usage.
- If no colors are provided, the builder falls back to `["#000", "#fff"]`.
- `setRoot()` currently expects an `HTMLElement` whose inline style can receive the CSS variable.

## Minimal React Example

```tsx
import { useEffect } from "react";
import { createShareGradient } from "sharegradient";

export function GradientPanel() {
  useEffect(() => {
    const gradient = createShareGradient()
      .setColors(["#f43f5e", "#fb7185", "#fde68a"])
      .setCssVariable("--panel-gradient")
      .setAnimationMode("swirl")
      .build();

    gradient.start();

    return () => gradient.stop();
  }, []);

  return <section style={{ background: "var(--panel-gradient)" }}>Hello</section>;
}
```

## Development

```bash
npm test
npm run test:coverage
npm run build
```

## License

MIT
