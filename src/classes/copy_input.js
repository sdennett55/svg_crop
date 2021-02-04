class CopyInput {
  constructor(svg, filename) {
    this.svg = svg;
    this.filename = filename;

    this.addCopyInput();
  }

  addCopyInput() {
    const copyInput = document.createElement('input');
    copyInput.classList.add('CopyInput');
    copyInput.ariaHidden = true;
    copyInput.value = this.svg.outerHTML;
    const mainElement = document.querySelector('.MainContent');
    mainElement.appendChild(copyInput);
  }
}

export default CopyInput;