(function () {
  // USER: Set either a width OR height (will scale evenly)
  const WIDTH = null;
  const HEIGHT = null;
  const invisibleElems = ['foreignObject', 'svg', 'text', 'style', 'title', 'desc'];
  const mainElement = document.querySelector('.MainContent');
  const buttonWrapElem = document.querySelector('.ButtonWrap');

  class CroppedSVG {
    constructor(svg, width, height) {
      this.width = width;
      this.height = height;
      this.coords = {
        top: Infinity,
        left: Infinity,
        bottom: -Infinity,
        right: -Infinity,
      }
      this.svg = svg;

      this.render(this.svg);
    }

    static deleteExisting() {
      this.svg = null;
      const svg = document.querySelector('svg');
      svg && mainElement.removeChild(svg);

      const copyInput = mainElement.querySelector('.CopyInput');
      copyInput && mainElement.removeChild(copyInput);

      const downloadButton = buttonWrapElem.querySelector('a')
      downloadButton && buttonWrapElem.removeChild(downloadButton);

      const copyButton = buttonWrapElem.querySelector('button')
      copyButton && buttonWrapElem.removeChild(copyButton);

    }

    download() {
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
      a.setAttribute('download', 'cropped.svg');
      a.textContent = 'Download'
      buttonWrapElem.appendChild(a);
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


      const result = [svg].reduce(flatten, []).filter(elem => elem.tagName && !invisibleElems.includes(elem.tagName) && (elem.getBoundingClientRect().width || elem.getBoundingClientRect().height));

      return result;
    }

    getCoords() {
      this.filterSVGToVisibleElements(this.svg).forEach((x, index, arr) => {
        const {
          top: newTop,
          left: newLeft,
          bottom: newBottom,
          right: newRight
        } = x.getBoundingClientRect();

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
      this.svg.setAttribute('viewBox', `${CroppedSVG.formatViewBoxNum(this.coords.left)} ${CroppedSVG.formatViewBoxNum(this.coords.top)} ${CroppedSVG.formatViewBoxNum(this.coords.right - this.coords.left)} ${CroppedSVG.formatViewBoxNum(this.coords.bottom - this.coords.top)}`);

      if (WIDTH) {
        this.svg.setAttribute('width', WIDTH);
        this.svg.removeAttribute('height');
      } else if (HEIGHT) {
        this.svg.setAttribute('height', HEIGHT);
        this.svg.removeAttribute('width');
      }
    }

    createCopyInput() {
      const copyInput = document.createElement('input');
      copyInput.classList.add('CopyInput')
      copyInput.ariaHidden = true;
      copyInput.value = this.svg.outerHTML;
      mainElement.appendChild(copyInput);
    }

    render() {
      this.removeAttributes();
      this.getCoords();
      this.setNewAttributes();
      this.createCopyInput();
      this.download();
      this.svg.style.position = 'static';
      this.svg.style.opacity = '1';
    }
  }

  class Form {
    constructor() {
      this.loadFileInput = document.querySelector('#myfile');
      this.loadFileInput.addEventListener('change', this.onFileInputChange.bind(this));
    }

    static handleFile(file) {
      if (!file.name.endsWith('.svg')) {
        return console.error(`Please provide an svg file with the .svg extension in the filename.`)
      }

      const reader = new FileReader();
      reader.readAsText(file);

      reader.onloadend = function (e) {
        const svg = e.target.result;

        var parser = new DOMParser();
        var svgElem = parser.parseFromString(svg, "image/svg+xml").documentElement;

        if (svgElem.tagName === 'html') {
          return console.error(`The SVG is malformed. Please try again.`)
        } else {
          mainElement.insertBefore(svgElem, document.querySelector('form'))
        }

        new CroppedSVG(svgElem);

        // copy svg data to clipboard
        const buttonElem = document.createElement('button');
        buttonElem.textContent = 'Copy to clipboard';
        buttonElem.classList.add('CopyButton');
        buttonElem.addEventListener('click', Form.copyToClipboard);
        buttonWrapElem.appendChild(buttonElem);
      }

    }

    onFileInputChange() {
      const file = this.loadFileInput.files[0];
      CroppedSVG.deleteExisting();
      Form.handleFile(file);
      gtag('event', 'uploaded SVG via input', {'event_label': file.name});
    }

    static copyToClipboard() {
      const copyText = document.querySelector('.CopyInput');
      console.log('yoyoyoy', copyText)
      if (copyText) {
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
      }
    }

  }

  class DropZone {
    constructor() {
      this.dropZone = document.querySelector('#drop_zone');
      this.dropZone.addEventListener('dragover', this.dragOverHandler.bind(this));
      this.dropZone.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
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
          return console.error(`Please provide only one SVG file.`);
        }

        if (ev.dataTransfer.items[0].kind === 'file') {
          var file = ev.dataTransfer.items[0].getAsFile();
          Form.handleFile(file);
          gtag('event', 'uploaded SVG via drop', {'event_label': file.name});
        }
      }
    }
  }

  const dropZone = new DropZone();

  const form = new Form();
})();
