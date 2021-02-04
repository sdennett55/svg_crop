import {prepareFilesForDownload} from '../utilities';

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
    prepareFilesForDownload(ev.dataTransfer.files, 'uploaded SVG via drop');
  }
}

export default DropZone;