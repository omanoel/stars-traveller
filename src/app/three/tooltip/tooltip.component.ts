import { Input, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html'
})
export class TooltipComponent implements OnInit {

    @Input() star: any;

    ngOnInit() {
        this.star = null;
    }

}
