import ErrorMessage from './error_message';
import {prepareFilesForDownload, cleanUpElements} from '../utilities';

class Form {
  constructor() {
    this.loadFileInput = document.querySelector('#myfile');
    this.loadFileInput.addEventListener(
      'change',
      this.onFileInputChange.bind(this)
    );
  }

  async onFileInputChange(ev) {
    const files = this.loadFileInput.files;
    cleanUpElements();
    prepareFilesForDownload(files, 'uploaded SVG via input');
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

export default Form;