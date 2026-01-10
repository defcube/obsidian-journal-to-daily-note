export function setCssProps(
  element: HTMLElement,
  props: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(props)) {
    element.style.setProperty(key, value);
  }
}
