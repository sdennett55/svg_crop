import type JSZip = require('jszip');

interface SVGObject {
  filename: string;
  svg: SVGElement;
}

class MultipleDownloadButton {
  constructor(public svgs: SVGObject[]) {
    this.svgs = svgs;

    this.addMultipleDownloadButton();
  }

  saveAs(blob: Blob, filename: string) {
    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
      return navigator.msSaveOrOpenBlob(blob, filename);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
      return navigator.msSaveBlob(blob, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      elem.style.display = 'none';
      elem.style.opacity = '0';
      elem.style.color = 'transparent';
      (document.body || document.documentElement).appendChild(elem);
      if (typeof elem.click === 'function') {
        elem.click();
      } else {
        elem.dispatchEvent(
          new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
          })
        );
      }
      URL.revokeObjectURL(elem.href);
    }
  }

  async clickHandler(zip: JSZip, buttonElem: HTMLButtonElement) {
    let prevText = '';

    if (this.svgs.length > 50) {
      prevText = buttonElem.innerText;
      buttonElem.setAttribute('disabled', '');
      buttonElem.innerText = 'Downloading...';
    }

    const content = await zip.generateAsync({ type: 'blob' });
    this.saveAs(content, 'SVGCropFiles.zip');

    if (this.svgs.length > 50) {
      buttonElem.removeAttribute('disabled');
      buttonElem.innerText = prevText;
    }
  }

  async addMultipleDownloadButton() {
    if (this.svgs.length < 1) {
      return;
    }

    const JSZip = await import('jszip');
    const zip = new JSZip();

    this.svgs.forEach((eachSvg) => {
      const { svg, filename } = eachSvg;

      // Serialize the svg to string
      const svgString = new XMLSerializer().serializeToString(svg);
      // Remove any characters outside the Latin1 range
      const decoded = unescape(encodeURIComponent(svgString));
      // Now we can use btoa to convert the svg to base64
      const base64 = btoa(decoded);

      zip.file(filename, base64, { base64: true });
    });

    const buttonElem = document.createElement('button');
    buttonElem.textContent = `Download ${this.svgs.length} Files`;
    buttonElem.classList.add('DownloadButton');
    buttonElem.addEventListener('click', this.clickHandler.bind(this, zip, buttonElem));
    const buttonWrapElem = document.querySelector('.ButtonWrap') as HTMLElement;
    buttonWrapElem.appendChild(buttonElem);


  }
}

export default MultipleDownloadButton;