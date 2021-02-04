import Form from './form';

class CopyToClipboardButton {
  constructor(svg, filename) {
    this.svg = svg;
    this.filename = filename;

    this.addCopyToClipboardButton();
  }

  addCopyToClipboardButton() {
    const buttonWrapElem = document.querySelector('.ButtonWrap');
    // Add "Copy to Clipboard" Button
    const buttonElem = document.createElement('button');
    buttonElem.textContent = 'Copy to clipboard';
    buttonElem.classList.add('CopyButton');
    buttonElem.addEventListener('click', Form.copyToClipboard);
    buttonWrapElem.appendChild(buttonElem);
  }

}

export default CopyToClipboardButton;