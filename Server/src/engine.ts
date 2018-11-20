import {Airplane, AirplaneData} from './airplane';

interface CallbackFunction {
    (airplanes: AirplaneData[]): void;
}

export class ATAEngine {
    public onGeneratedDistances: CallbackFunction = (() => {});
    myAircraft: Airplane;
    dangerDistance: number;
    warningDistance: number;
    watchDistance: number;
    private timer;

    generateDistances(tempAircraftInfo: Airplane[]) {
        const airplanes = tempAircraftInfo.map((aircraft: AirplaneData) => {
            // the haversine formula takes 2 points(latlong) and finds the distances between them.
            // generally takes around 5 ms to calculate
            var R = 6371e3; // metres
            var φ1 = toRadians(this.myAircraft.latitude);
            var φ2 = toRadians(aircraft.latitude);
            var Δφ = toRadians(aircraft.latitude - this.myAircraft.latitude);
            var Δλ = toRadians(aircraft.longitude - this.myAircraft.longitude);

            var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            aircraft.distance = R * c;

            if (aircraft.distance > this.watchDistance) {
                aircraft.flightZone = 'safe';
            } else if (aircraft.distance > this.warningDistance) {
                aircraft.flightZone = 'watch';
            } else if (aircraft.distance > this.dangerDistance) {
                aircraft.flightZone = 'warning';
            } else {
                aircraft.flightZone = 'danger';
            }
            return aircraft;
        });

        this.onGeneratedDistances(airplanes);
    }

    updateZones() {

    }


    setClentAirplaneIdenifier(id: string) {
        // do
    }
}

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

