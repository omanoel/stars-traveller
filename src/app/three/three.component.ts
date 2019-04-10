import { Component, HostListener, OnInit } from '@angular/core';
import { StarOver } from '@app/utils/interfaces';

@Component({
    selector: 'app-three',
    templateUrl: './three.component.html'
})
export class ThreeComponent implements OnInit {

    myStarOver: StarOver;
    height: number;
    width: number;

    ngOnInit() {
        this.myStarOver = {star: null};
        this.resetWidthHeight();
    }

    @HostListener('window:resize')
    resetWidthHeight() {
        this.height = window.innerHeight - 20;
        this.width = window.innerWidth - 20;
    }

}
