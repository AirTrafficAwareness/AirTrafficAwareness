import {Component, EventEmitter, OnInit, Optional, Output} from '@angular/core';
import {Airplane, Coordinate} from '../airplane';
import {ATAService} from '../ata.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public defaultServer = 'localhost:3000';
  public serverAddress = '';
  public airplanes: Airplane[];
  public connected = false;

  @Output() select = new EventEmitter<Airplane>();

  constructor(
    @Optional() public dialogRef: MatDialogRef<ListComponent>,
    private snackBar: MatSnackBar,
    private ata: ATAService) {
    this.ata.airplanes.subscribe(airplanes => {
      airplanes.sort((a, b) => a.proximity.distance - b.proximity.distance);
      this.airplanes = airplanes;
    });
  }

  public connect(event: MouseEvent) {
    const address = this.serverAddress || this.defaultServer;
    this.getLocation()
      .catch(e => {
        console.log('error', e);
        return {latitude: 39.015, longitude: -94.565};
      })
      .then((coords) => this.ata.connect(address, coords).toPromise()
        .then(() => this.connected = true))
      .catch(error => this.snackBar.open(error && error.message || 'Unable to connect. ' + JSON.stringify(error), 'OK'));
  }

  itemSelected(item: Airplane) {
    if (this.dialogRef) {
      this.dialogRef.close(item);
    } else {
      this.select.next(item);
    }
  }

  async getLocation(): Promise<Coordinate> {
    return {latitude: 36.541088, longitude: -115.005248};
    // return new Promise(((resolve, reject) => {
    //   return ();
    //   // navigator.geolocation.getCurrentPosition(resolve, () => ({coords: {latitude: 39.015, longitude: -94.565}}));
    // }));
  }

  ngOnInit(): void {
    this.connected = true;
    this.connect(null);
  }
}
