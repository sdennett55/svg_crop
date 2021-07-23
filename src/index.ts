import DropZone from './Components/DropZone';
import FileInput from './Components/FileInput';
import {serviceWorker} from './sw';

import './main.css';

new DropZone();
new FileInput();
serviceWorker();
