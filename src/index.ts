import DropZone from './Components/DropZone';
import FileInput from './Components/FileInput';
import PasteMarkupInput from './Components/PasteMarkupInput';
import { serviceWorker } from './sw';

import './main.css';

new DropZone();
new FileInput();
new PasteMarkupInput();
serviceWorker();
