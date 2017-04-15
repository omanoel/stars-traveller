import {
  Component,
  trigger,
  transition,
  animate,
  style,
  state,
  ElementRef
} from '@angular/core';
import { requestFullScreen } from './utils/fullscreen';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isFullScreen = false;

  constructor(private element: ElementRef) {

  }

  toggleFullScreen(changes) {
    this.isFullScreen = !this.isFullScreen;

    if (!this.isFullScreen) {
      requestFullScreen(this.element.nativeElement);
    }
  }
}
