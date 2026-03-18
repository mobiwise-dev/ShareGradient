export const IS_BROWSER = typeof window !== "undefined" && typeof document !== "undefined";
export const isReducedMotion = IS_BROWSER && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
