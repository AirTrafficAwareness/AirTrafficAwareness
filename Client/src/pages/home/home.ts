import {Component, OnInit} from '@angular/core';
import {ModalController} from "ionic-angular";
import {ListPage} from "../list/list";
import {AirTrafficAwarenessClient} from "../../providers/air-traffic-awareness-client";
import {Airplane, Proximity} from "../../models/airplane";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  views: { [view: string]: AirplaneView } = {};
  connected = false;

  constructor(public modalController: ModalController,
              private airplaneProvider: AirTrafficAwarenessClient) {
  }

  ngOnInit(): void {
    const svg = <any>document.getElementById('svg') as SVGSVGElement;
    const airplane = svg.getElementById('airplane') as SVGGElement;
    airplane.remove();
    console.log('airplane', airplane);

    const modal = this.modalController.create(ListPage, null, {
      enableBackdropDismiss: false
    });
    modal.onDidDismiss(data => {
      console.log(data);
      this.airplaneProvider.currentAirplane = data;
      this.connected = true;
    });
    modal.present().catch(err => console.error(err));

    this.airplaneProvider.onUpdate.subscribe(airplanes => {
      // Mark all existing views for deletion.
      Object.values(this.views).forEach(view => view.touched = false);

      airplanes.forEach((a: Airplane) => {
        const {heading, identifier, proximity} = a;

        if (!proximity || !proximity.position || (!proximity.position.x && !proximity.position.y)) {
          return;
        }

        let view = this.views[identifier];
        if (!view) {
          const clone = airplane.cloneNode(true) as SVGGElement;
          clone.id = identifier;
          svg.appendChild(clone);
          view = new AirplaneView(clone);
          this.views[identifier] = view;
        }

        view.setProximity(proximity, heading);
        view.touched = true;
      });

      // Remove all view that were not updated.
      Object.keys(this.views).forEach(k => {
        const view = this.views[k];
        if (!view.touched) {
          view.svgElement.remove();
          delete this.views[k];
        }
      });
    });
  }

}

class AirplaneView {
  touched = false;

  constructor(public svgElement: SVGGElement) {}

  setProximity(proximity: Proximity, heading) {
    const angle = heading + 270;
    this.svgElement.className.baseVal = `airplane ${proximity.flightZone}`;
    this.svgElement.setAttribute('data-distance', `${proximity.distance}`);
    this.svgElement.setAttribute('transform', `translate(${proximity.position.x} ${proximity.position.y}) rotate(${angle} 0 0) scale(0.5)`);
  }

}
