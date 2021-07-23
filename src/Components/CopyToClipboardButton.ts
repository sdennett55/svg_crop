import { copyToClipboard } from '../utilities';

class CopyToClipboardButton {
  constructor(public svg: SVGElement, public filename: string) {
    this.svg = svg;
    this.filename = filename;

    this.addCopyToClipboardButton();
  }

  addCopyToClipboardButton() {
    const buttonWrapElem = document.querySelector('.ButtonWrap') as HTMLElement;
    const buttonElem = document.createElement('button') as HTMLButtonElement;
    buttonElem.textContent = 'Copy to clipboard';
    buttonElem.classList.add('CopyButton');
    buttonElem.addEventListener('click', copyToClipboard);
    buttonWrapElem.appendChild(buttonElem);
  }
}

export default CopyToClipboardButton;
