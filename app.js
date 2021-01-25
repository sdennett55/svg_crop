(function () {
  // USER: Set either a width OR height (will scale evenly)
  const WIDTH = 100;
  const HEIGHT = null;
  const invisibleElems = ['svg', 'text', 'defs', 'style', 'title', 'desc'];
  const mainElement = document.querySelector('.MainContent');
  const buttonWrapElem = document.querySelector('.ButtonWrap');

  class CroppedSVG {
    constructor(svg, width, height) {
      this.width = width || 100;
      this.height = height || null;
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
      const textarea = document.querySelector('textarea');
      textarea && mainElement.removeChild(textarea);
      const download = document.querySelector('a[download]')
      download && mainElement.removeChild(download);

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
      a.setAttribute('download', 'whatever.svg');
      a.textContent = 'Download'
      buttonWrapElem.appendChild(a);
    }

    removeViewBox() {
      this.svg.removeAttribute('viewBox');
    }

    filterSVGToVisibleElements(svg) {
      function flatten(ops, n) {
        ops.push(n);
        if (n.childNodes && n.childNodes.length) {
          [].reduce.call(n.childNodes, flatten, ops);
        }
        return ops;
      }


      const result = [svg].reduce(flatten, []).filter(elem => elem.tagName && !invisibleElems.includes(elem.tagName));

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

        // console.log(x.id, {newTop, newLeft, newBottom, newRight})

        if (newTop < this.coords.top) {
          this.coords.top = newTop;
        }
        // if 0 < 10
        if (newLeft < this.coords.left) {
          // console.log('wtf', newLeft, this.coords.left);
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

    setNewAttributes() {
      this.svg.setAttribute('viewBox', `${this.coords.left.toFixed(2)} ${this.coords.top.toFixed(2)} ${(this.coords.right - this.coords.left).toFixed(2)} ${(this.coords.bottom - this.coords.top).toFixed(2)}`);

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
      this.removeViewBox();
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

      Form.handleFile(file);
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
        }
      }
    }
  }

  const dropZone = new DropZone();

  const form = new Form();
})();