function canWriteStyle(root: unknown): root is HTMLElement {
  return !!root && typeof (root as HTMLElement).style?.setProperty === "function";
}

export function injectVariable(name: string, value: string, root?: HTMLElement) {
  const target = canWriteStyle(root) ? root : document.documentElement;
  target.style.setProperty(name, value);
}
