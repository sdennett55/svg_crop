import CroppedSVG from './classes/cropped_svg';
import DownloadButton from './classes/download_button';
import MultipleDownloadButton from './classes/multiple_download_button';
import CopyToClipboardButton from './classes/copy_to_clipboard_button';
import ColorToggleButton from './classes/color_toggle_button';
import CopyInput from './classes/copy_input';
import Form from './classes/form';
import ErrorMessage from './classes/error_message';

function cleanUpElements() {
  document.querySelector('.PreviewSection').innerHTML = '';
  document.querySelector('.ButtonWrap').innerHTML = '';
  const copyInput = document.querySelector('.CopyInput');
  const mainElement = document.querySelector('.MainContent');
  copyInput && mainElement.removeChild(copyInput);
}

async function prepareFilesForDownload(files, eventLabel) {
  cleanUpElements();

  if (files) {
    let modifiedSvg;
    let filename;
    let multipleSvgs = [];
    let fileCount = 0;
    let filesNotSVG = [];

    for (const file of [...files]) {
      fileCount++;
      if (file.type === 'image/svg+xml') {
        filename = file.name;
        try {
          modifiedSvg = await handleFile(file);
          const croppedSvg = new CroppedSVG(modifiedSvg, filename);
          multipleSvgs.push({ svg: croppedSvg.svg, filename: croppedSvg.filename });
          gtag('event', eventLabel, { event_label: file.name });
        } catch {
          filesNotSVG.push(file.name);
        }
      } else {
        filesNotSVG.push(file.name);
      }
    }

    if (fileCount > 1) {
      if (fileCount !== filesNotSVG.length) {
        new ColorToggleButton(modifiedSvg, filename);
        new MultipleDownloadButton(multipleSvgs);
      }
      if (filesNotSVG.length > 0) {
        return new ErrorMessage(`Error: The following files were malformed or not SVGs: ${filesNotSVG.join(', ')}`);
      }
    } else {
      if (filesNotSVG.length > 0) {
        return new ErrorMessage(`Error: The following files were not SVGs: ${filesNotSVG.join(', ')}`)
      }
      new CopyInput(modifiedSvg, filename);
      new ColorToggleButton(modifiedSvg, filename);
      new DownloadButton(modifiedSvg, filename);
      new CopyToClipboardButton(modifiedSvg, filename);
    }
  }
}

async function handleFile(file) {
  if (!file.name.endsWith('.svg')) {
    throw new Error();
  }

  let resolvePromiseTo;
  const onLoadPromise = new Promise(resolve => {
    resolvePromiseTo = resolve;
  });

  const reader = new FileReader();
  reader.readAsText(file);

  reader.onloadend = function (e) {
    let svg = e.target.result;

    if (!svg) {
      return resolvePromiseTo(new Error());
    }

    if (!svg.includes('xmlns')) {
      svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    var parser = new DOMParser();
    var svgElem = parser.parseFromString(svg, 'image/svg+xml')
      .documentElement;

    if (svgElem.tagName === 'html') {
      return resolvePromiseTo(new Error());
    }

    resolvePromiseTo(svgElem);
  };

  return onLoadPromise;
}

export { prepareFilesForDownload, cleanUpElements }