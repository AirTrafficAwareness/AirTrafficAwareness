import {Airplane} from './airplane';

type CallbackFunction = (airplanes: Airplane[]) => void;

export class ATAEngine {
    public onGeneratedDistances: CallbackFunction = (() => {});
    clientAirplane: Airplane;
    dangerDistance:  number =  75000;
    warningDistance: number = 150000;
    watchDistance:   number = 220000;

    determineProximity(tempAircraftInfo: Airplane[]) {
        if (!this.clientAirplane) {
            return tempAircraftInfo;
        }

        const airplanes = tempAircraftInfo.map((airplane: Airplane) => {
            if (airplane.identifier == this.clientAirplane.identifier) {
                this.clientAirplane = airplane;
                return airplane;
            }

            const distance = this.calculateDistance(airplane);
            const flightZone = this.calculateFlightZone(distance);
            const position = this.calculatePosition(airplane);

            airplane.proximity = {distance, flightZone, position};

            return airplane;
        });

        this.onGeneratedDistances(airplanes);
    }

    updateZones() {

    }

    calculateDistance(airplane) {
        // the haversine formula takes 2 points(latlong) and finds the distances between them.
        // generally takes around 5 ms to calculate
        var R = 6371e3; // metres
        var φ1 = toRadians(this.clientAirplane.latitude);
        var φ2 = toRadians(airplane.latitude);
        var Δφ = toRadians(airplane.latitude - this.clientAirplane.latitude);
        var Δλ = toRadians(airplane.longitude - this.clientAirplane.longitude);

        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    calculateFlightZone(distance) {
        let flightZone = '';
        if (distance > this.watchDistance) {
            flightZone = 'safe';
        } else if (distance > this.warningDistance) {
            flightZone = 'notice';
        } else if (distance > this.dangerDistance) {
            flightZone = 'caution';
        } else {
            flightZone = 'danger';
        }

        return flightZone;
    }

    calculatePosition(airplane) {
        return {x: 0, y: 0};
    }
}

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}
