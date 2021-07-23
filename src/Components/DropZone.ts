import {prepareFilesForDownload} from '../utilities';

class DropZone {
  dropZone: HTMLElement;

  constructor() {
    this.dropZone = document.querySelector('#drop_zone') as HTMLElement;
    this.dropZone.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.dropZone.addEventListener(
      'dragleave',
      this.dragLeaveHandler.bind(this)
    );
    this.dropZone.addEventListener('drop', this.dropHandler.bind(this));
  }

  dragOverHandler(e: DragEvent) {
    e.preventDefault();
    this.dropZone.classList.add('is-hovered');
  }

  dragLeaveHandler(e: DragEvent) {
    e.preventDefault();
    this.dropZone.classList.remove('is-hovered');
  }

  async dropHandler(e: DragEvent) {
    e.preventDefault();
    this.dropZone.classList.remove('is-hovered');
    prepareFilesForDownload(e.dataTransfer?.files, 'uploaded SVG via drop');
  }
}

export default DropZone;
