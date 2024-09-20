export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes?: Partial<HTMLElementTagNameMap[T]>,
  insertToApp: string | boolean = true
): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag);
  if (attributes) {
    Object.assign(element, attributes);
  }
  if (typeof insertToApp === "string") {
    document.querySelector(insertToApp)?.appendChild(element);
  } else if (insertToApp) {
    document.querySelector("#app")?.appendChild(element);
  }
  return element;
}
