import {Component} from '@angular/core';
import {AlertController, ViewController} from "ionic-angular";
import {Geolocation} from '@ionic-native/geolocation';
import {AirTrafficAwarenessClient} from "../../providers/air-traffic-awareness-client";
import {Airplane} from "../../models/airplane";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  public defaultServer = "localhost:3000";
  public serverAddress = "";
  public airplanes: Airplane[];
  public connected = false;

  constructor(private viewController: ViewController,
              private alertController: AlertController,
              private location: Geolocation,
              private ata: AirTrafficAwarenessClient) {

    this.ata.onUpdate.subscribe(airplanes => {
      airplanes.sort((a, b) => a.proximity.distance - b.proximity.distance);
      this.airplanes = airplanes;
    });
  }

  public connect(event: MouseEvent) {
    console.log(event);
    console.log(this.serverAddress);
    const address = this.serverAddress || this.defaultServer;
    this.location.getCurrentPosition()
      .then(({coords}) => this.ata.connect(address, coords).toPromise()
        .then(() => this.connected = true))
      .catch(error => this.alertController.create({
        title: 'Error',
        subTitle: error && error.message || 'Unable to connect.',
        buttons: ['OK']
      }).present());
  }

  itemSelected(item) {
    this.viewController.dismiss(item).catch(err => console.error(err));
  }

}
