export function requestFullScreen(el: Element | HTMLElement): void {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  }
}
