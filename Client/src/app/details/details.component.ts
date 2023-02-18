import {ChangeDetectorRef, Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {Airplane} from '../airplane';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {ATAService} from '../ata.service';
import {GDL90Service} from '../gdl90.service';
import {StratuxService} from '../stratux.service';
import {TailNumberPromptComponent} from '../tail-number-prompt/tail-number-prompt.component';
import {MatDialog} from '@angular/material/dialog';

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
    private stratux: StratuxService,
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public data: { airplane: Airplane }
  ) {
    if (data) {
      this.injected = true;
      this.airplane = data.airplane;
    }
  }


  private currentAirplane() {
    if (this.stratux.isAvailable) {
      return this.stratux.currentAirplane;
    }

    if (this.gdl90.isAvailable) {
      return this.gdl90.currentAirplane;
    }

    return this.ata.currentAirplane;
  }

  get isCurrent(): boolean {
    const currentAirplane = this.currentAirplane();
    return this.airplane && currentAirplane && this.airplane.identifier === currentAirplane.identifier;
  }

  ngOnInit() {
    if (this.stratux.isAvailable) {
      this.stratux.airplanes.subscribe(airplanes => this.update(airplanes));
    } else if (this.gdl90.isAvailable) {
      this.gdl90.airplanes.subscribe(airplanes => this.update(airplanes));
    } else {
      this.ata.airplanes.subscribe(airplanes => this.update(airplanes));
    }
  }

  update(airplanes: Airplane[]) {
    const currentAirplane = this.currentAirplane();
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

  async editNNumber(event: Event): Promise<void> {
    const dialogRef = this.dialog.open(TailNumberPromptComponent, {
      // width: '250px',
      position: {top: "50px"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.animal = result;
      // alert(result);
      if (result && result.length) {
        this.stratux.setOwnship(result);
      }
    });
    // this.ata.currentAirplane = airplane;
    // this.current = false;
    // this.detailsComponent.airplane = airplane;
    // this.bottomSheet.open(DetailsComponent, {data: {airplane}});
    // const popover = await this.popoverController.create({
    //   component: DetailsComponent,
    //   componentProps: {airplane},
    //   event
    // });
    // return await popover.present();
  }
}
