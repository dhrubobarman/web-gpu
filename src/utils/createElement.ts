export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes?: Partial<HTMLElementTagNameMap[T]>,
  parentElement: HTMLElement | boolean = true
): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag);
  if (attributes) {
    Object.assign(element, attributes);
  }
  if (parentElement === true) {
    document.querySelector('#app')?.appendChild(element);
  } else if (parentElement) {
    parentElement.appendChild(element);
  }
  return element;
}
