import { Input, Component, OnInit } from '@angular/core';
import { StarOver } from '@app/utils/interfaces';

@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

    @Input() starOver: StarOver;

    objectKeys = Object.keys;

    ngOnInit() {
    }

}
