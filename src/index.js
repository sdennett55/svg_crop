const JSZip = require("jszip");

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
      enhanceButtonElem && previewSectionElem.removeChild(enhanceButtonElem);
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

    render() {
      this.addSvg();
      this.removeAttributes();
      this.getCoords();
      this.setNewAttributes();
    }
  }

  class DownloadButton {
    constructor(svg, filename) {
      this.svg = svg;
      this.filename = filename;

      this.deleteExisting();
      this.addDownloadButton();
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

    deleteExisting() {
      const downloadButton = buttonWrapElem.querySelector('a');
      downloadButton && buttonWrapElem.removeChild(downloadButton);
    }
  }

  class MultipleDownloadButton {
    constructor(svgs) {
      this.svgs = svgs;

      this.deleteExisting();
      this.addMultipleDownloadButton();
    }

    addMultipleDownloadButton() {
      if (this.svgs.length < 1) {
        return;
      }

      function saveAs(blob, filename) {
        if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
          return navigator.msSaveOrOpenBlob(blob, fileName);
        } else if (typeof navigator.msSaveBlob !== 'undefined') {
          return navigator.msSaveBlob(blob, fileName);
        } else {
          var elem = window.document.createElement('a');
          elem.href = window.URL.createObjectURL(blob);
          elem.download = filename;
          elem.style = 'display:none;opacity:0;color:transparent;';
          (document.body || document.documentElement).appendChild(elem);
          if (typeof elem.click === 'function') {
            elem.click();
          } else {
            elem.target = '_blank';
            elem.dispatchEvent(new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            }));
          }
          URL.revokeObjectURL(elem.href);
        }
      }

      const zip = new JSZip();

      this.svgs.forEach((eachSvg, index) => {
        const { svg, filename } = eachSvg;

        // Serialize the svg to string
        var svgString = new XMLSerializer().serializeToString(svg);
        // Remove any characters outside the Latin1 range
        var decoded = unescape(encodeURIComponent(svgString));
        // Now we can use btoa to convert the svg to base64
        var base64 = btoa(decoded);
        var imgSource = `data:image/svg+xml;base64,${base64}`;

        zip.file(filename, imgSource, {base64: true});
      })

      zip.generateAsync({ type: "blob" })
        .then(function (content) {
          // see FileSaver.js
          saveAs(content, "example.zip");
        });



      var a = document.createElement('a');
      a.href = imgSource;
      a.setAttribute(
        'download',
        `${filename.replace('.svg', '')}-cropped.svg`
      );
      a.textContent = `Download ${this.svgs.length} Files`;
      buttonWrapElem.appendChild(a);
    }

    deleteExisting() {
      const downloadButton = buttonWrapElem.querySelector('a');
      downloadButton && buttonWrapElem.removeChild(downloadButton);
    }
  }

  class CopyToClipboardButton {
    constructor(svg, filename) {
      this.svg = svg;
      this.filename = filename;

      this.deleteExisting();
      this.addCopyToClipboardButton();
    }

    deleteExisting() {
      const copyButton = buttonWrapElem.querySelector('button');
      copyButton && buttonWrapElem.removeChild(copyButton);
    }

    addCopyToClipboardButton() {
      // Add "Copy to Clipboard" Button
      const buttonElem = document.createElement('button');
      buttonElem.textContent = 'Copy to clipboard';
      buttonElem.classList.add('CopyButton');
      buttonElem.addEventListener('click', Form.copyToClipboard);
      buttonWrapElem.appendChild(buttonElem);
    }

  }

  class ColorToggleButton {
    constructor(svg, filename) {
      this.svg = svg;
      this.filename = filename;

      this.deleteExisting();
      this.addColorToggle();
    }

    deleteExisting() {
      const colorToggleButtonElem = previewSectionElem.querySelector(
        '.ColorToggleButton'
      );
      colorToggleButtonElem &&
        previewSectionElem.removeChild(colorToggleButtonElem);
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
  }

  class CopyInput {
    constructor(svg, filename) {
      this.svg = svg;
      this.filename = filename;

      this.deleteExisting();
      this.addCopyInput();
    }

    deleteExisting() {
      const copyInput = mainElement.querySelector('.CopyInput');
      copyInput && mainElement.removeChild(copyInput);
    }

    addCopyInput() {
      const copyInput = document.createElement('input');
      copyInput.classList.add('CopyInput');
      copyInput.ariaHidden = true;
      console.log('woahhh', this.svg, typeof this.svg);
      copyInput.value = this.svg.outerHTML;
      mainElement.appendChild(copyInput);
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

    static async handleFile(file) {
      if (!file.name.endsWith('.svg')) {
        return new ErrorMessage(
          `Please provide an svg file with the .svg extension in the filename.`
        );
      }

      let resolvePromiseTo;
      const onLoadPromise = new Promise(resolve => {
        resolvePromiseTo = resolve;
      });

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

        resolvePromiseTo(svgElem);
      };

      return onLoadPromise;
    }

    async onFileInputChange() {
      const file = this.loadFileInput.files[0];
      CroppedSVG.deleteExisting();
      const modifiedSvg = await Form.handleFile(file);
      new CroppedSVG(modifiedSvg, file.name);
      new CopyInput(modifiedSvg, file.name);
      new ColorToggleButton(modifiedSvg, file.name);
      new DownloadButton(modifiedSvg, file.name);
      new CopyToClipboardButton(modifiedSvg, file.name);
      gtag('event', 'uploaded SVG via input', { event_label: file.name });
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

    async dropHandler(ev) {
      ev.preventDefault();
      this.dropZone.classList.remove('is-hovered');
      CroppedSVG.deleteExisting();

      if (ev.dataTransfer.files) {
        let modifiedSvg;
        let filename;
        let multipleSvgs = [];

        for (const eachSvg of [...ev.dataTransfer.files]) {
          if (eachSvg.type === 'image/svg+xml') {
            var file = eachSvg;
            filename = file.name;
            modifiedSvg = await Form.handleFile(file);
            const croppedSvg = new CroppedSVG(modifiedSvg, filename);
            gtag('event', 'uploaded SVG via drop', { event_label: file.name });
            console.log(multipleSvgs);
     
          }
        }

        if (ev.dataTransfer.files.length > 1) {
          // return new ErrorMessage(`Please provide only one SVG file.`);
          const copyInput = new CopyInput(modifiedSvg, filename);
          const colorToggleBtn = new ColorToggleButton(modifiedSvg, filename);
          const downloadBtn = new DownloadButton(modifiedSvg, filename);
          const copyToClipboardBtn = new CopyToClipboardButton(modifiedSvg, filename);
        } else {
          const colorToggleBtn = new ColorToggleButton(modifiedSvg, filename);
          const multipleDownloadBtn = new MultipleDownloadButton(multipleSvgs);
        }

      }
    }
  }

  const dropZone = new DropZone();

  const form = new Form();
})();
