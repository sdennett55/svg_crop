import DropZone from './Components/DropZone';
import Form from './Components/Form';
import {serviceWorker} from './sw';

import './main.css';

new DropZone();
new Form();
serviceWorker();
