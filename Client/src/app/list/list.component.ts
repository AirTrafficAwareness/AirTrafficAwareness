import {Component, OnInit} from '@angular/core';
import {Airplane, Coordinate} from '../airplane';
import {ATAService} from '../ata.service';
import {MatDialogRef, MatSnackBar} from '@angular/material';

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

  constructor(
    public dialogRef: MatDialogRef<ListComponent>,
    private snackBar: MatSnackBar,
    private ata: ATAService) {
    this.ata.onUpdate.subscribe(airplanes => {
      airplanes.sort((a, b) => a.proximity.distance - b.proximity.distance);
      this.airplanes = airplanes;
    });
  }

  public connect(event: MouseEvent) {
    console.log(event);
    console.log(this.serverAddress);
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
    this.dialogRef.close(item);
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
