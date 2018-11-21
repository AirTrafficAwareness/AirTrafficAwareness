import {Airplane, Coordinate} from './airplane';

type CallbackFunction = (airplanes: Airplane[]) => void;
type FlightZones = { danger: number, caution: number, notice: number };

export class ATAEngine {
    public onGeneratedDistances: CallbackFunction = (() => {});
    static origin: Airplane;
    flightZones: FlightZones;

    determineProximity(airplanes: Airplane[]) {
        if (!ATAEngine.origin) {
            return airplanes;
        }

        if (!this.flightZones) {
            this.updateZones();
        }

        airplanes.forEach(airplane => {
            if (airplane.identifier == ATAEngine.origin.identifier) {
                ATAEngine.origin = airplane;
            }

            const distance = this.calculateDistance(airplane);
            const flightZone = this.calculateFlightZone(distance);
            const position = this.calculatePosition(airplane);

            airplane.proximity = {distance, flightZone, position};
        });

        this.onGeneratedDistances(airplanes);
    }

    updateZones() {
        // TODO: Calculate zones based on velocity, or use proper heuristic values.
        const radius = 9260; // 5 nautical miles
        this.flightZones = {
            danger: radius,
            caution: radius * 2,
            notice: radius * 3,
        };
    }

    calculateDistance(airplane) {
        // the haversine formula takes 2 points(latlong) and finds the distances between them.
        // generally takes around 5 ms to calculate
        var R = 6371e3; // metres
        var φ1 = toRadians(ATAEngine.origin.latitude);
        var φ2 = toRadians(airplane.latitude);
        var Δφ = toRadians(airplane.latitude - ATAEngine.origin.latitude);
        var Δλ = toRadians(airplane.longitude - ATAEngine.origin.longitude);

        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    calculateFlightZone(distance) {
        const {danger, caution, notice} = this.flightZones;
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

    calculatePosition(airplane) {
        return {x: 0, y: 0};
    }
}

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}
