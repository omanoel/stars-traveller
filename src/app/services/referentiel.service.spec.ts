import { TestBed, inject } from '@angular/core/testing';

import { ReferentielService } from './referentiel.service';

describe('ReferentielService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ReferentielService]
        });
    });

    it('should ...', inject([ReferentielService], (service: ReferentielService) => {
        expect(service).toBeTruthy();
    }));
});
