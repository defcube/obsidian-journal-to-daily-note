export function setCssProps(
  element: HTMLElement,
  props: Partial<CSSStyleDeclaration>,
): void {
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined && value !== null) {
      // @ts-ignore - Dynamic access to style properties
      element.style[key] = value;
    }
  }
}
