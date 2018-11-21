import {Airplane} from './airplane';

interface CallbackFunction {
    (airplanes: Airplane[]): void;
}

export class ATAEngine {
    public onGeneratedDistances: CallbackFunction = (() => {});
    clientAirplane: Airplane;
    dangerDistance:  number =  75000;
    warningDistance: number = 150000;
    watchDistance:   number = 220000;

    generateDistances(tempAircraftInfo: Airplane[]) {
        if (!this.clientAirplane) {
            return tempAircraftInfo;
        }

        const airplanes = tempAircraftInfo.map((airplane: Airplane) => {
            if (airplane.identifier == this.clientAirplane.identifier) {
                this.clientAirplane = airplane;
                return airplane;
            }

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

            const proximity = {distance: R * c, flightZone: '', position: {x: 0, y: 0}};

            if (proximity.distance > this.watchDistance) {
                proximity.flightZone = 'safe';
            } else if (proximity.distance > this.warningDistance) {
                proximity.flightZone = 'notice';
            } else if (proximity.distance > this.dangerDistance) {
                proximity.flightZone = 'caution';
            } else {
                proximity.flightZone = 'danger';
            }

            airplane.proximity = proximity;

            return airplane;
        });

        this.onGeneratedDistances(airplanes);
    }

    updateZones() {

    }

}

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

