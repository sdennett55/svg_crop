import {prepareFilesForDownload, cleanUpElements} from '../utilities';

class Form {
  constructor() {
    this.loadFileInput = document.querySelector('#myfile');
    this.loadFileInput.addEventListener(
      'change',
      this.onFileInputChange.bind(this)
    );
  }

  async onFileInputChange() {
    cleanUpElements();
    const files = this.loadFileInput.files;
    prepareFilesForDownload(files, 'uploaded SVG via input');
  }
}

export default Form;
