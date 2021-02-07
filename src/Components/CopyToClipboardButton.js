import {copyToClipboard} from '../utilities';

class CopyToClipboardButton {
  constructor(svg, filename) {
    this.svg = svg;
    this.filename = filename;

    this.addCopyToClipboardButton();
  }

  addCopyToClipboardButton() {
    const buttonWrapElem = document.querySelector('.ButtonWrap');
    const buttonElem = document.createElement('button');
    buttonElem.textContent = 'Copy to clipboard';
    buttonElem.classList.add('CopyButton');
    buttonElem.addEventListener('click', copyToClipboard);
    buttonWrapElem.appendChild(buttonElem);
  }
}

export default CopyToClipboardButton;
