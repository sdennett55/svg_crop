import { prepareFilesForDownload, prepareMarkupForDownload, cleanUpElements } from '../utilities';

class PasteMarkupInput {
  pasteMarkupInput: HTMLInputElement;
  pasteMarkupButton: HTMLButtonElement;

  constructor() {
    this.pasteMarkupInput = document.querySelector('#mymarkup') as HTMLInputElement;
    this.pasteMarkupButton = document.querySelector('.MarkupButton') as HTMLButtonElement;
    this.pasteMarkupInput.addEventListener(
      'keyup',
      // @ts-ignore
      this.onMarkupInputChange.bind(this)
    );
    this.pasteMarkupButton.addEventListener(
      'click',
      // @ts-ignore
      this.onMarkupButtonClick.bind(this)
    );
  }

  async onMarkupInputChange({ target }: { target: HTMLInputElement }) {
    cleanUpElements();
    const markup = target.value;
    prepareMarkupForDownload(markup, 'uploaded SVG via markup paste');
  }

  onMarkupButtonClick() {
    const input = (document.querySelector('.MarkupInput') as HTMLInputElement);
    const button = (document.querySelector('.MarkupButton') as HTMLButtonElement);
    button.style.display = 'none';
    button.tabIndex = -1;
    input.style.display = 'block';
    input.focus();
  }
}

export default PasteMarkupInput;
