import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ATAService} from '../ata.service';
import {Airplane} from '../airplane';
import {DetailsComponent} from '../details/details.component';
import {MatBottomSheet, MatDialog} from '@angular/material';
import {ListComponent} from '../list/list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  views: { [view: string]: AirplaneView } = {};
  container: SVGGElement;
  airplaneNode: SVGGElement;
  current = false;

  constructor(
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    // private modalController: ModalController,
    // private popoverController: PopoverController,
    public ata: ATAService) {
  }

  async ngOnInit(): Promise<void> {
    const svg = document.getElementById('svg') as any as SVGSVGElement;
    this.container = svg.getElementById('container') as SVGGElement;
    const airplaneNode = svg.getElementById('airplane') as SVGGElement;
    airplaneNode.remove();
    this.airplaneNode = airplaneNode;

    this.ata.onUpdate.subscribe(airplanes => {
      this.current = Boolean(this.ata.currentAirplane);

      // Mark all existing views for deletion.
      Object.values(this.views).forEach(view => view.touched = false);

      airplanes.forEach((airplane: Airplane) => {
        this.updateAirplane(airplane);
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

  ngAfterViewInit() {
    if (!this.ata.currentAirplane) {
      setTimeout(() => this.showList());
    }
  }

  showList() {
    const dialogRef = this.dialog.open(ListComponent);
    dialogRef.afterClosed().subscribe(data => {
      this.ata.currentAirplane = data;
    });
    // const modal = await this.modalController.create({
    //   component: 'app-list',
    //   backdropDismiss: false
    // });
    // const {data} = await modal.onDidDismiss();
    // console.log(data);
    // this.ata.currentAirplane = data;
    // return await modal.present();
  }

  async showDetails(event: Event, airplane): Promise<void> {
    this.ata.currentAirplane = airplane;
    this.current = false;
    // this.bottomSheet.open(DetailsComponent, {data: {airplane}});
    // const popover = await this.popoverController.create({
    //   component: DetailsComponent,
    //   componentProps: {airplane},
    //   event
    // });
    // return await popover.present();
  }

  private updateAirplane(airplane: Airplane) {
    const {heading, identifier, proximity} = airplane;

    if (!proximity || !proximity.position || (!proximity.position.x && !proximity.position.y)) {
      return;
    }

    let view = this.views[identifier];
    if (!view) {
      const node = this.airplaneNode.cloneNode(true) as SVGGElement;
      node.id = identifier;
      this.container.appendChild(node);
      node.onclick = (event) => this.showDetails(event, airplane);
      view = new AirplaneView(node);
      this.views[identifier] = view;
    }

    if (this.ata.currentAirplane && identifier === this.ata.currentAirplane.identifier) {
      this.container.setAttribute('transform', `rotate(${-heading} 360 360)`);
      airplane.proximity.flightZone = 'safe';
    }

    view.airplane = airplane;
    view.touched = true;
  }
}

class AirplaneView {
  touched = false;

  constructor(public svgElement: SVGGElement) {}

  set airplane(airplane: Airplane) {
    const proximity = airplane.proximity;
    this.svgElement.className.baseVal = `airplane ${proximity.flightZone}`;
    this.svgElement.setAttribute('data-distance', `${proximity.distance}`);
    this.svgElement.setAttribute('data-heading', `${airplane.heading}`);
    const transform = [
      `translate(${proximity.position.x} ${proximity.position.y})`,
      `rotate(${airplane.heading} 0 0)`,
      `scale(0.5)`
    ];
    this.svgElement.setAttribute('transform', transform.join(' '));
  }
}
