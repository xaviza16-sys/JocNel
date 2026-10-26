export function controlCaption(button: HTMLButtonElement, text: string) {
  let caption = button.querySelector<HTMLElement>('.control-caption');
  if (!caption) { caption = document.createElement('span'); caption.className = 'control-caption'; button.append(caption); }
  caption.textContent = text;
}
