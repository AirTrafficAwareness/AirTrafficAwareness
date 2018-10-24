import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  airplaneView: AirplaneView;
  frameRequestCallback: FrameRequestCallback;

  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  eventHandler(event: MouseEvent | TouchEvent) {
    const {clientX: x, clientY: y} = event instanceof MouseEvent ? event : event.touches[0];
    this.airplaneView.addPoint({x, y});
  }

  ngOnInit(): void {
    const svg = <any>document.getElementById('svg') as SVGSVGElement;
    const airplane = svg.getElementById('airplane') as SVGGElement;
    const geometry = new Geometry(svg);

    this.airplaneView = new AirplaneView(airplane, geometry);
    this.frameRequestCallback = time => {
      this.airplaneView.update();
      requestAnimationFrame(this.frameRequestCallback);
    };
    requestAnimationFrame(this.frameRequestCallback);
  }

}

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

class Vector implements Point {
  x: number;
  y: number;

  constructor(point: Point) {
    this.x = point.x;
    this.y = point.y;
  }

  static get zero() {
    return new Vector({x: 0, y: 0})
  }

  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set magnitude(value: number) {
    this.normalize();
    this.multiply(value);
  }

  get isZero() {
    return this.x === 0 && this.y === 0;
  }

  subtract(point: Point) {
    this.x -= point.x;
    this.y -= point.y;
  }

  normalize() {
    const magnitude = this.magnitude;
    this.x /= magnitude;
    this.y /= magnitude;
  }

  multiply(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
  }

  add(point: Point) {
    this.x += point.x;
    this.y += point.y;
  }

  limit(max: number) {
    if (this.magnitude > max) {
      this.magnitude = max;
    }
  }

  heading() {
    return Math.atan2(this.y, this.x) * 180 / Math.PI;
  }

  distance(toPoint: Point): number {
    const to = new Vector(toPoint);
    to.subtract(this);
    return to.magnitude;
  }

}

class Geometry {
  private svgPoint: SVGPoint;

  constructor(private svg: SVGSVGElement) {
    this.svgPoint = this.svg.createSVGPoint();
  }

  get svgSize(): Size {
    const {width, height} = this.svg.viewBox.baseVal;
    return {width, height};
  }

  get screenSize(): Size {
    const {width, height} = this.svg.getBoundingClientRect();
    return {width, height};
  }

  get svgCenter(): Point {
    const {width, height} = this.svgSize;
    return {x: width / 2, y: height / 2};
  }
  toSVG(point: Point) {
    return this.convert(point, true);
  }

  toScreen(point: Point) {
    return this.convert(point, false);
  }

  private convert(point: Point, inverse: boolean): Point {
    this.svgPoint.x = point.x;
    this.svgPoint.y = point.y;
    const matrix = this.svg.getScreenCTM();
    return this.svgPoint.matrixTransform(inverse ? matrix.inverse() : matrix);
  }
}

class AirplaneView {
  position: Vector;
  velocity = Vector.zero;
  acceleration = Vector.zero;
  topSpeed = 3;

  constructor(public svgElement: SVGGElement, public geometry: Geometry) {
    const box = this.geometry.svgSize;
    console.log('box', box,);
    this.position = new Vector(this.geometry.svgCenter);
    this.updateHeading(270);
  }

  updateHeading(angle) {
    this.svgElement.setAttribute('transform', `translate(${this.position.x} ${this.position.y}) rotate(${angle} 0 0)`);
  }

  addPoint(point: Point) {
    const acceleration = new Vector(this.geometry.toSVG(point));
    acceleration.subtract(this.position);
    acceleration.magnitude = 0.5;
    this.acceleration = acceleration;
  }

  update() {
    if (this.acceleration.isZero) {
      return;
    }
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topSpeed);
    this.position.add(this.velocity);

    this.updateHeading(this.velocity.heading());
    this.checkBounds();
  }

  checkBounds() {
    const pos = this.geometry.toScreen(this.position);
    const bounds = this.geometry.screenSize;
    const width = bounds.width;
    const height = bounds.height;

    let update = false;
    if (pos.x > width) {
      update = true;
      pos.x = 0;
    } else if (pos.x < 0) {
      update = true;
      pos.x = width;
    }

    if (pos.y > height) {
      update = true;
      pos.y = 0;
    } else if (pos.y < 0) {
      update = true;
      pos.y = height;
    }

    if (update) {
      this.position = new Vector(this.geometry.toSVG(pos));
    }

    let distance = this.position.distance(this.geometry.svgCenter);
    if (distance > 360) {
      this.svgElement.className.baseVal ="safe";
    }else if (distance > 240) {
      this.svgElement.className.baseVal="notice";
    }else if (distance > 120) {
      this.svgElement.className.baseVal="caution";
    } else {
      this.svgElement.className.baseVal="danger";
    }
  }
}
