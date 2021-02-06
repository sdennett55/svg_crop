import DropZone from './classes/drop_zone';
import Form from './classes/form';
import {serviceWorker} from './sw';

import './main.css';

new DropZone();
new Form();
serviceWorker();