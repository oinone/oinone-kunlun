import { DetailNumberWidget } from '../../detail';
import GalleryString from '../string/default/GalleryString.vue';

export class GalleryNumberWidget extends DetailNumberWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryString);
    return this;
  }
}
