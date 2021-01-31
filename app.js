(function () {
  // USER: Set either a width OR height (will scale evenly)
  const WIDTH = null;
  const HEIGHT = null;
  const invisibleElems = [
    'defs',
    'g',
    'foreignObject',
    'svg',
    'style',
    'title',
    'desc',
  ];
  const mainElement = document.querySelector('.MainContent');
  const buttonWrapElem = document.querySelector('.ButtonWrap');
  const previewSectionElem = document.querySelector('.PreviewSection');

  class ErrorMessage {
    constructor(message) {
      this.message = message;
      this.errorElem = null;

      this.render();
    }

    delete() {
      this.errorElem = document.querySelector('.ErrorMessage');
      const existingErrorMsg = document.body.querySelector('.ErrorMessage');
      if (existingErrorMsg) {
        document.body.removeChild(existingErrorMsg);
      }
      this.errorElem = null;
    }

    render() {
      this.delete();
      const errorDiv = document.createElement('div');
      errorDiv.classList.add('ErrorMessage');
      errorDiv.innerText = this.message;
      document.body.appendChild(errorDiv);
      this.errorElem = errorDiv;
    }
  }

  class CroppedSVG {
    constructor(svg, filename, width, height) {
      this.width = width;
      this.height = height;
      this.filename = filename;
      this.coords = {
        top: Infinity,
        left: Infinity,
        bottom: -Infinity,
        right: -Infinity,
      };
      this.svg = svg;

      this.render(this.svg);
    }

    static deleteExisting() {
      this.svg = null;
      const svg = document.querySelector('svg');
      const enhanceButtonElem = document.querySelector('.EnhanceButton');
      svg && enhanceButtonElem.removeChild(svg);

      const copyInput = mainElement.querySelector('.CopyInput');
      copyInput && mainElement.removeChild(copyInput);

      const downloadButton = buttonWrapElem.querySelector('a');
      downloadButton && buttonWrapElem.removeChild(downloadButton);

      const copyButton = buttonWrapElem.querySelector('button');
      copyButton && buttonWrapElem.removeChild(copyButton);

      enhanceButtonElem && previewSectionElem.removeChild(enhanceButtonElem);

      const colorToggleButtonElem = previewSectionElem.querySelector(
        '.ColorToggleButton'
      );
      colorToggleButtonElem &&
        previewSectionElem.removeChild(colorToggleButtonElem);
    }

    addDownloadButton() {
      if (!this.svg) {
        return;
      }

      // Serialize the svg to string
      var svgString = new XMLSerializer().serializeToString(this.svg);

      // Remove any characters outside the Latin1 range
      var decoded = unescape(encodeURIComponent(svgString));

      // Now we can use btoa to convert the svg to base64
      var base64 = btoa(decoded);

      var imgSource = `data:image/svg+xml;base64,${base64}`;

      var a = document.createElement('a');
      a.href = imgSource;
      a.setAttribute(
        'download',
        `${this.filename.replace('.svg', '')}-cropped.svg`
      );
      a.textContent = 'Download';
      buttonWrapElem.appendChild(a);
    }

    addCopyToClipboardButton() {
      // Add "Copy to Clipboard" Button
      const buttonElem = document.createElement('button');
      buttonElem.textContent = 'Copy to clipboard';
      buttonElem.classList.add('CopyButton');
      buttonElem.addEventListener('click', Form.copyToClipboard);
      buttonWrapElem.appendChild(buttonElem);
    }

    removeAttributes() {
      this.svg.removeAttribute('viewBox');
      this.svg.removeAttribute('width');
      this.svg.removeAttribute('height');
    }

    filterSVGToVisibleElements(svg) {
      function flatten(ops, n) {
        ops.push(n);
        if (n.childNodes && n.childNodes.length) {
          [].reduce.call(n.childNodes, flatten, ops);
        }
        return ops;
      }

      const result = [svg].reduce(flatten, []).filter((elem) => {
        return (
          elem.tagName &&
          !invisibleElems.includes(elem.tagName) &&
          (elem.getBoundingClientRect().width ||
            elem.getBoundingClientRect().height) &&
          !elem.parentElement.hasAttribute('mask') &&
          elem.parentElement.tagName !== 'defs' &&
          (getComputedStyle(elem).stroke !== 'none' ||
            getComputedStyle(elem).fill !== 'none')
        );
      });

      return result;
    }

    getCoords() {
      this.filterSVGToVisibleElements(this.svg).forEach((x, index, arr) => {
        let {
          top: newTop,
          left: newLeft,
          bottom: newBottom,
          right: newRight,
        } = x.getBoundingClientRect();

        const stroke = getComputedStyle(x)['stroke'];
        const strokeWidth = Number(
          getComputedStyle(x)['stroke-width'].replace('px', '')
        );

        if (stroke !== 'none') {
          newTop = newTop - strokeWidth / 2;
          newLeft = newLeft - strokeWidth / 2;
          newBottom = newBottom + strokeWidth / 2;
          newRight = newRight + strokeWidth / 2;
        }

        if (newTop < this.coords.top) {
          this.coords.top = newTop;
        }
        if (newLeft < this.coords.left) {
          this.coords.left = newLeft;
        }
        if (newRight > this.coords.right) {
          this.coords.right = newRight;
        }
        if (newBottom > this.coords.bottom) {
          this.coords.bottom = newBottom;
        }
      });
    }

    static formatViewBoxNum(num) {
      return num.toFixed(2) * 1;
    }

    setNewAttributes() {
      this.svg.setAttribute(
        'viewBox',
        `${CroppedSVG.formatViewBoxNum(
          this.coords.left
        )} ${CroppedSVG.formatViewBoxNum(
          this.coords.top
        )} ${CroppedSVG.formatViewBoxNum(
          this.coords.right - this.coords.left
        )} ${CroppedSVG.formatViewBoxNum(this.coords.bottom - this.coords.top)}`
      );

      this.svg.style.position = 'static';
      this.svg.style.opacity = '1';

      if (WIDTH) {
        this.svg.setAttribute('width', WIDTH);
        this.svg.removeAttribute('height');
      } else if (HEIGHT) {
        this.svg.setAttribute('height', HEIGHT);
        this.svg.removeAttribute('width');
      }
    }

    addCopyInput() {
      const copyInput = document.createElement('input');
      copyInput.classList.add('CopyInput');
      copyInput.ariaHidden = true;
      copyInput.value = this.svg.outerHTML;
      mainElement.appendChild(copyInput);
    }

    addSvg() {
      function handleImageEnhance(e) {
        e.target.classList.toggle('is-enhanced');
      }

      // Add SVG to the screen inside the enhance button
      const enhanceBtn = document.createElement('button');
      enhanceBtn.classList.add('EnhanceButton');
      enhanceBtn.addEventListener('click', handleImageEnhance);
      enhanceBtn.appendChild(this.svg);
      previewSectionElem.appendChild(enhanceBtn);
    }

    addColorToggle() {
      function handleColorToggle(e) {
        mainElement.classList.toggle('is-blackBg');

        if (e.target.textContent === 'Preview on black') {
          e.target.children[0].textContent = 'Preview on white';
          e.target.children[0].setAttribute('title', `Preview on white`);
        } else {
          e.target.children[0].textContent = 'Preview on black';
          e.target.children[0].setAttribute('title', `Preview on black`);
        }
      }

      // add a11y text
      const a11yText = document.createElement('span');
      a11yText.classList.add('AccessibleText');
      a11yText.textContent = `Preview on black`;
      a11yText.setAttribute('title', `Preview on black`);

      // add color toggle button
      const blackColorBtn = document.createElement('button');
      blackColorBtn.classList.add('ColorToggleButton');
      blackColorBtn.appendChild(a11yText);
      blackColorBtn.addEventListener('click', handleColorToggle);
      previewSectionElem.appendChild(blackColorBtn);
    }

    render() {
      this.addSvg();
      this.removeAttributes();
      this.getCoords();
      this.setNewAttributes();
      
      this.addColorToggle();
      this.addCopyInput();
      this.addDownloadButton();
      this.addCopyToClipboardButton();
    }
  }

  class Form {
    constructor() {
      this.loadFileInput = document.querySelector('#myfile');
      this.loadFileInput.addEventListener(
        'change',
        this.onFileInputChange.bind(this)
      );
    }

    static handleFile(file) {
      if (!file.name.endsWith('.svg')) {
        return new ErrorMessage(
          `Please provide an svg file with the .svg extension in the filename.`
        );
      }

      const reader = new FileReader();
      reader.readAsText(file);

      reader.onloadend = function (e) {
        let svg = e.target.result;

        if (!svg.includes('xmlns')) {
          svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        var parser = new DOMParser();
        var svgElem = parser.parseFromString(svg, 'image/svg+xml')
          .documentElement;

        if (svgElem.tagName === 'html') {
          return new ErrorMessage(`The SVG is malformed. Please try again.`);
        }

        new CroppedSVG(svgElem, file.name);
      };
    }

    onFileInputChange() {
      const file = this.loadFileInput.files[0];
      CroppedSVG.deleteExisting();
      Form.handleFile(file);
      gtag('event', 'uploaded SVG via input', {event_label: file.name});
    }

    static copyToClipboard() {
      const copyText = document.querySelector('.CopyInput');
      if (copyText) {
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand('copy');
      }
    }
  }

  class DropZone {
    constructor() {
      this.dropZone = document.querySelector('#drop_zone');
      this.dropZone.addEventListener(
        'dragover',
        this.dragOverHandler.bind(this)
      );
      this.dropZone.addEventListener(
        'dragleave',
        this.dragLeaveHandler.bind(this)
      );
      this.dropZone.addEventListener('drop', this.dropHandler.bind(this));
    }

    dragOverHandler(ev) {
      ev.preventDefault();
      this.dropZone.classList.add('is-hovered');
    }

    dragLeaveHandler(ev) {
      ev.preventDefault();
      this.dropZone.classList.remove('is-hovered');
    }

    dropHandler(ev) {
      ev.preventDefault();
      this.dropZone.classList.remove('is-hovered');
      CroppedSVG.deleteExisting();

      if (ev.dataTransfer.items) {
        if (ev.dataTransfer.items.length > 1) {
          return new ErrorMessage(`Please provide only one SVG file.`);
        }

        for (const eachSvg of ev.dataTransfer.items) {
          if (ev.dataTransfer.items[0].kind === 'file') {
            var file = eachSvg.getAsFile();
            Form.handleFile(file);
            gtag('event', 'uploaded SVG via drop', {event_label: file.name});
          }
        }

      }
    }
  }

  const dropZone = new DropZone();

  const form = new Form();
})();
