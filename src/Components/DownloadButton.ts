class DownloadButton {
  constructor(public svg: Node, public filename: string) {
    this.svg = svg;
    this.filename = filename;

    this.addDownloadButton();
  }

  addDownloadButton() {
    if (!this.svg) {
      return;
    }

    // Serialize the svg to string
    const svgString = new XMLSerializer().serializeToString(this.svg);

    // Remove any characters outside the Latin1 range
    const decoded = unescape(encodeURIComponent(svgString));

    // Now we can use btoa to convert the svg to base64
    const base64 = btoa(decoded);

    const imgSource = `data:image/svg+xml;base64,${base64}`;

    const a = document.createElement('a');
    a.href = imgSource;
    a.setAttribute(
      'download',
      `${this.filename.replace('.svg', '')}-cropped.svg`
    );
    a.textContent = 'Download';
    const buttonWrapElem = document.querySelector('.ButtonWrap') as HTMLElement;
    buttonWrapElem.appendChild(a);
  }
}

export default DownloadButton;
