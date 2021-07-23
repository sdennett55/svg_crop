class CopyInput {
  constructor(public svg: SVGElement, public filename: string) {
    this.svg = svg;
    this.filename = filename;

    this.addCopyInput();
  }

  addCopyInput() {
    const copyInput = document.createElement('input');
    copyInput.classList.add('CopyInput');
    copyInput.setAttribute('aria-hidden', '');
    copyInput.value = this.svg.outerHTML;
    const mainElement = document.querySelector('.MainContent') as HTMLElement;
    mainElement.appendChild(copyInput);
  }
}

export default CopyInput;
