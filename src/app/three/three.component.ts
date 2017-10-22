import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-three',
    templateUrl: './three.component.html'
})
export class ThreeComponent implements OnInit {

    myStarOver: any;
    height: number;
    width: number;

    ngOnInit() {
        this.resetWidthHeight();
    }

    @HostListener('window:resize')
    resetWidthHeight() {
        this.height = window.innerHeight - 20;
        this.width = window.innerWidth - 20;
        console.log('window resize', this.height, this.width);
    }

}
