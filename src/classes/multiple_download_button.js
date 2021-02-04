import JSZip from 'jszip';

class MultipleDownloadButton {
  constructor(svgs) {
    this.svgs = svgs;

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

    this.svgs.forEach(eachSvg => {
      const { svg, filename } = eachSvg;

      // Serialize the svg to string
      var svgString = new XMLSerializer().serializeToString(svg);
      // Remove any characters outside the Latin1 range
      var decoded = unescape(encodeURIComponent(svgString));
      // Now we can use btoa to convert the svg to base64
      var base64 = btoa(decoded);

      zip.file(filename, base64, { base64: true });
    })

    var buttonElem = document.createElement('button');
    buttonElem.textContent = `Download ${this.svgs.length} Files`;
    buttonElem.classList.add('DownloadButton');
    buttonElem.addEventListener('click', () => {
      zip.generateAsync({ type: "blob" })
        .then(function (content) {
          // see FileSaver.js
          saveAs(content, "SVGCropFiles.zip");
        });
    });
    const buttonWrapElem = document.querySelector('.ButtonWrap');
    buttonWrapElem.appendChild(buttonElem);
  }
}

export default MultipleDownloadButton;