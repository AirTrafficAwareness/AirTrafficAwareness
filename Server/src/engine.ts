import {Airplane, AirplaneData} from './airplane';

interface CallbackFunction {
    (airplanes: AirplaneData[]): void;
}

export class TcasEngine {
    public onGeneratedDistances: CallbackFunction = (() => {});
    public aircraftInfoJson;
    aircraftFlightInfo: JSON;
    myAircraft: JSON;
    aircraftJson: JSON;
    dangerDistance: number;
    warningDistance: number;
    watchDistance: number;
    private timer;

    generateDistances(tempAircraftInfo: Airplane[]) {
        const airplanes = tempAircraftInfo.map((aircraft: AirplaneData) => {
            // the haversine formula takes 2 points(latlong) and finds the distances between them.
            // generally takes around 5 ms to calculate
            var R = 6371e3; // metres
            var φ1 = toRadians(this.myAircraft['lat1']);
            var φ2 = toRadians(aircraft['lat2']);
            var Δφ = toRadians(aircraft['lat2'] - this.myAircraft['lat1']);
            var Δλ = toRadians(aircraft['lon2'] - this.myAircraft['lon1']);

            var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            aircraft['distance'] = R * c;

            if (aircraft['distance'] > this.watchDistance) {
                aircraft['flightZone'] = 'safe';
            } else if (aircraft['distance'] > this.warningDistance) {
                aircraft['flightZone'] = 'watch';
            } else if (aircraft['distance'] > this.dangerDistance) {
                aircraft['flightZone'] = 'warning';
            } else {
                aircraft['flightZone'] = 'danger';
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
