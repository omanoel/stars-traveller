import { Input, Component, HostListener, OnInit, OnChanges } from '@angular/core';

@Component({
    selector: 'app-three',
    templateUrl: './three.component.html'
})
export class ThreeComponent implements OnInit, OnChanges {

    @Input() ngModel: any;

    @Input() height: number;
    @Input() width: number;

    ngOnInit() {
        this.resetWidthHeight();
    }

    ngOnChanges(changes) {
        if (changes.ngModel && changes.ngModel.currentValue) {
            console.log('changes', changes);
        }
    }

    @HostListener('window:resize')
    resetWidthHeight() {
        this.height = window.innerHeight - 20;
        this.width = window.innerWidth - 20;
        console.log('window resize', this.height, this.width);
    }

}
