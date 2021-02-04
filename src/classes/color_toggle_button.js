class ColorToggleButton {
  constructor(svg, filename) {
    this.svg = svg;
    this.filename = filename;

    this.addColorToggle();
  }

  addColorToggle() {
    function handleColorToggle(e) {
      const mainElement = document.querySelector('.MainContent');
      mainElement.classList.toggle('is-blackBg');

      if (e.target.textContent === 'Preview on black') {
        e.target.children[0].textContent = 'Preview on white';
        e.target.setAttribute('title', `Preview on white`);
      } else {
        e.target.children[0].textContent = 'Preview on black';
        e.target.setAttribute('title', `Preview on black`);
      }
    }

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
    blackColorBtn.addEventListener('click', handleColorToggle);
    colorToggleWrap.appendChild(blackColorBtn);
    const previewSectionElem = document.querySelector('.PreviewSection');
    previewSectionElem.appendChild(colorToggleWrap);
  }
}

export default ColorToggleButton;