const isRobotoStyle = (element: HTMLElement): boolean => {
  // roboto font download
  if (
    (element as HTMLLinkElement).href &&
    (element as HTMLLinkElement).href.indexOf(
      'https://fonts.googleapis.com/css?family=Roboto'
    ) === 0
  ) {
    return true
  }
  // roboto style elements
  if (
    element.tagName.toLowerCase() === 'style' &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element.styleSheet &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element.styleSheet.cssText &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element.styleSheet.cssText.replace('\r\n', '').indexOf('.gm-style') === 0
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element.styleSheet.cssText = ''
    return true
  }
  // roboto style elements for other browsers
  if (
    element.tagName.toLowerCase() === 'style' &&
    element.innerHTML &&
    element.innerHTML.replace('\r\n', '').indexOf('.gm-style') === 0
  ) {
    element.innerHTML = ''
    return true
  }
  // when google tries to add empty style
  if (
    element.tagName.toLowerCase() === 'style' &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    !element.styleSheet &&
    !element.innerHTML
  ) {
    return true
  }

  return false
}

// Preventing the Google Maps library from downloading an extra font
export const preventGoogleFonts = (): void => {
  // we override these methods only for one particular head element
  // default methods for other elements are not affected
  const head = document.getElementsByTagName('head')[0]

  const trueInsertBefore = head.insertBefore.bind(head)

  // TODO: adding return before reflect solves the TS issue
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  head.insertBefore = function insertBefore(
    newElement: HTMLElement,
    referenceElement: HTMLElement
  ): void {
    if (!isRobotoStyle(newElement)) {
      Reflect.apply(trueInsertBefore, head, [newElement, referenceElement])
    }
  }

  const trueAppend = head.appendChild.bind(head)

  // TODO: adding return before reflect solves the TS issue
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  head.appendChild = function appendChild(textNode: HTMLElement): void {
    if (!isRobotoStyle(textNode)) {
      Reflect.apply(trueAppend, head, [textNode])
    }
  }
}
