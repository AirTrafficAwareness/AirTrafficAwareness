import {ChangeDetectorRef, Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {Airplane} from '../airplane';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {ATAService} from '../ata.service';
import {GDL90Service} from '../gdl90.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  airplane: Airplane = null;
  private injected = false;

  constructor(
    private ata: ATAService,
    private gdl90: GDL90Service,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public data: { airplane: Airplane }
  ) {
    if (data) {
      this.injected = true;
      this.airplane = data.airplane;
    }
  }

  get isCurrent(): boolean {
    const currentAirplane = this.gdl90.isAvailable ? this.gdl90.currentAirplane : this.ata.currentAirplane;
    return this.airplane && currentAirplane && this.airplane.identifier === currentAirplane.identifier;
  }

  ngOnInit() {
    if (this.gdl90.isAvailable) {
      this.gdl90.airplanes.subscribe(airplanes => this.update(airplanes));
    } else {
      this.ata.airplanes.subscribe(airplanes => this.update(airplanes));
    }
  }

  update(airplanes: Airplane[]) {
    const currentAirplane = this.gdl90.isAvailable ? this.gdl90.currentAirplane : this.ata.currentAirplane;
    if (!this.airplane && currentAirplane) {
      this.airplane = currentAirplane;
    }

    if (!this.airplane) {
      return;
    }

    airplanes.filter(airplane => this.airplane.identifier === airplane.identifier).forEach((airplane: Airplane) => {
      this.airplane = airplane;
      this.changeDetectorRef.markForCheck();
    });
  }

}
