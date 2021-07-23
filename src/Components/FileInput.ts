import {prepareFilesForDownload, cleanUpElements} from '../utilities';

class FileInput {
  loadFileInput: HTMLInputElement;

  constructor() {
    this.loadFileInput = document.querySelector('#myfile') as HTMLInputElement;
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

export default FileInput;
