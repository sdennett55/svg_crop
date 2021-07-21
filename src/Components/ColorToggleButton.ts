class ColorToggleButton {
  constructor(public svg: HTMLOrSVGElement, public filename: string) {
    this.addColorToggle();
  }

  handleColorToggle(e: Event) {
    const mainElement = document.querySelector('.MainContent');
    mainElement!.classList.toggle('is-blackBg');

    const target = e.target as HTMLElement;

    if (target.textContent === 'Preview on black') {
      target.children[0].textContent = 'Preview on white';
      target.setAttribute('title', `Preview on white`);
    } else {
      target.children[0].textContent = 'Preview on black';
      target.setAttribute('title', `Preview on black`);
    }
  }

  addColorToggle() {
    // add a11y text
    const a11yText = document.createElement('span');
    a11yText.classList.add('AccessibleText');
    a11yText.textContent = `Preview on black`;

    // add color toggle button
    const colorToggleWrap = document.createElement('div');
    colorToggleWrap.classList.add('ColorToggleWrap');
    colorToggleWrap.setAttribute('title', `Preview on black`);

    const blackColorBtn = document.createElement('button');
    blackColorBtn.classList.add('ColorToggleButton');
    blackColorBtn.appendChild(a11yText);
    blackColorBtn.addEventListener('click', this.handleColorToggle);
    colorToggleWrap.appendChild(blackColorBtn);
    const previewSectionElem = document.querySelector('.PreviewSection');
    previewSectionElem!.appendChild(colorToggleWrap);
  }
}

export default ColorToggleButton;
