import {ChangeDetectorRef, Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {Airplane} from '../airplane';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import {ATAService} from '../ata.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  private pAirplane: Airplane;
  set airplane(airplane: Airplane) {
    this.pAirplane = airplane;
    this.changeDetectorRef.markForCheck();
  }

  get airplane() {
    return this.pAirplane;
  }

  private injected = false;
  constructor(
    private ata: ATAService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public data: { airplane: Airplane }) {
    if (data) {
      this.injected = true;
      console.log('airplane details', data.airplane);
      this.pAirplane = data.airplane;
    }
  }

  ngOnInit() {
    this.ata.onUpdate.subscribe(airplanes => {
      if (!this.injected) {
        this.airplane = this.ata.currentAirplane;
      }

      airplanes.forEach((airplane: Airplane) => {
        this.updateAirplane(airplane);
      });
    });
  }

  private updateAirplane(airplane: Airplane) {
    if (this.pAirplane.identifier !== airplane.identifier) {
      return;
    }

    console.log('updated details', airplane);
    this.airplane = airplane;
  }
}
