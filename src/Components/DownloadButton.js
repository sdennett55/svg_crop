class DownloadButton {
  constructor(svg, filename) {
    this.svg = svg;
    this.filename = filename;

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
    const buttonWrapElem = document.querySelector('.ButtonWrap');
    buttonWrapElem.appendChild(a);
  }
}

export default DownloadButton;
