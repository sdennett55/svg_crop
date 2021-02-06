import DropZone from './classes/drop_zone';
import Form from './classes/form';
import './main.css';
import {serviceWorker} from './sw';

new DropZone();
new Form();
serviceWorker();