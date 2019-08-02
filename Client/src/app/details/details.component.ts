import {ChangeDetectorRef, Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {Airplane} from '../airplane';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {ATAService} from '../ata.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  @Input() airplane: Airplane;
  private injected = false;

  constructor(
    private ata: ATAService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public data: { airplane: Airplane }
  ) {
    if (data) {
      this.injected = true;
      this.airplane = data.airplane;
    }
  }

  get isCurrent(): boolean {
    return this.airplane && this.ata.currentAirplane && this.airplane.identifier === this.ata.currentAirplane.identifier;
  }

  ngOnInit() {
    this.ata.airplanes.subscribe(airplanes => {
      if (!this.airplane) {
        return;
      }
      airplanes.filter(airplane => this.airplane.identifier === airplane.identifier).forEach((airplane: Airplane) => {
        this.airplane = airplane;
        this.changeDetectorRef.markForCheck();
      });
    });
  }

}
