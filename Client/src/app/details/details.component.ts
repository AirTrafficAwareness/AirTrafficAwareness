import {Component, OnInit} from '@angular/core';
import {Airplane} from '../../models/airplane';
import {ViewController} from "ionic-angular";

@Component({
  selector: 'page-details',
  templateUrl: 'details.html'
})
export class DetailsPage implements OnInit {

  public airplane: Airplane;

  constructor(private viewController: ViewController) {
    this.airplane = this.viewController.data.airplane;
    console.log(this.airplane);
  }

  ngOnInit() {
  }

}
