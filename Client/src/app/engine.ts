import {Airplane, Coordinate, Point} from './airplane';
import faaNumbers from '../assets/faaNumbers.json';
import {Injectable} from '@angular/core';

type CallbackFunction = (airplanes: Airplane[]) => void;

interface FlightZones {
  danger: number;
  caution: number;
  notice: number;
}

@Injectable({
  providedIn: 'root'
})
export class ATAEngine {
  public origin: Coordinate | Airplane;

  determineProximity(airplane: Airplane): Airplane {
    if (faaNumbers[airplane.identifier.toUpperCase()]) {
      const nNumber = 'N' + faaNumbers[airplane.identifier.toUpperCase()];
      Object.assign(airplane, {
        nNumber
      });
    }

    if (!this.origin) {
      return airplane;
    }

    const radius = toMeters(3); // Minimum horizontal separation is 3 nautical miles.
    const flightZones = {
      danger: radius,
      caution: radius * 2,
      notice: radius * 3,
    };

    const distanceInMeters = calculateDistance(airplane, this.origin);
    if ('identifier' in this.origin && airplane.identifier === this.origin.identifier) {
      console.log('Calculated ownship', distanceInMeters);
    }
    if (Math.abs(airplane.latitude) > 90 || Math.abs(airplane.longitude) > 180) {
      return;
    }
    Object.assign(airplane, {
      proximity: {
        distance: toNauticalMiles(distanceInMeters),
        flightZone: calculateFlightZone(distanceInMeters, flightZones),
        position: coordinateToPoint(airplane, this.origin, flightZones.notice)
      }
    });
    // this.saveToFile('record.json',airplanes);
    return airplane;
  }

  // private saveToFile(fileName, airplanes):void {
  //     const fs = require('fs');
  //     const BSON = require('bson');
  //     var stream = fs.createWriteStream(fileName, {flags:'a'});
  //     const data = BSON.serialize(airplanes);
  //     stream.write(data);
  //     stream.close();
  // }
}

function calculateDistance(coordinate: Coordinate, origin: Coordinate): number {
  const meanEarthRadius = 6371e3; // meters

  const latTo = toRadians(coordinate.latitude);
  const latFrom = toRadians(origin.latitude);
  const lonD = toRadians(coordinate.longitude - origin.longitude);

  const {acos, cos, sin} = Math;
  return acos(sin(latFrom) * sin(latTo) + cos(latFrom) * cos(latTo) * cos(lonD)) * meanEarthRadius;
}

function calculateFlightZone(distance: number, flightZones: FlightZones): string {
  const {danger, caution, notice} = flightZones;
  if (distance <= danger) {
    return 'danger';
  }

  if (distance <= caution) {
    return 'caution';
  }

  if (distance <= notice) {
    return 'notice';
  }

  return 'safe';
}

function coordinateToPoint(coordinate: Coordinate, origin: Coordinate, radius: number): Point {
  const userInterfaceRadius = 360; // points
  const scale = userInterfaceRadius / radius;

  const xDistance = (coordinate.longitude - origin.longitude) * metersPerLongitudeAtLatitude(origin.latitude);
  const yDistance = (coordinate.latitude - origin.latitude) * metersPerLatitudeAtLatitude(origin.latitude);

  const x = userInterfaceRadius + xDistance * scale;
  const y = userInterfaceRadius - yDistance * scale;

  return {x, y};
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function toNauticalMiles(meters: number): number {
  return meters / 1852;
}

function toMeters(nauticalMiles: number): number {
  return nauticalMiles * 1852;
}

function metersPerLongitudeAtLatitude(latitude): number {
  const radians = toRadians(latitude);
  const {cos} = Math;
  return 111415.13 * cos(radians)
    - 94.55 * cos(3.0 * radians)
    + 0.12 * cos(5.0 * radians);
}

function metersPerLatitudeAtLatitude(latitude): number {
  const radians = toRadians(latitude);
  const {cos} = Math;
  return 111132.09 - 566.05 * cos(2.0 * radians)
    + 1.2 * cos(4.0 * radians)
    - 0.002 * cos(6.0 * radians);
}
