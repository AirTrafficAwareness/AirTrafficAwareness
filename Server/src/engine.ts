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

        if ((<Airplane>ATAEngine.origin).identifier) {
            const updated = airplanes.find(airplane => airplane.identifier === ATAEngine.origin.identifier);
            if (updated) {
                ATAEngine.origin = updated;
                this.updateZones();
            }
        }

        if (!this.flightZones) {
            this.updateZones();
        }

        airplanes.forEach(airplane => {
            const distance = this.calculateDistance(airplane);
            const flightZone = this.calculateFlightZone(distance);
            const position = this.calculatePosition(airplane);

            airplane.proximity = {distance, flightZone, position};
        });

        this.onGeneratedDistances(airplanes);
    }

    updateZones() {
        // TODO: Calculate zones based on velocity, or use proper heuristic values.
        const radius = 9260 * 3; // 5 nautical miles
        this.flightZones = {
            danger: radius,
            caution: radius * 2,
            notice: radius * 3,
        };
    }

    calculateDistance(airplane) {
        const meanEarthRadius = 6371e3; // meters
        const from = ATAEngine.origin;
        const to = airplane;

        const latTo = toRadians(to.latitude);
        const latFrom = toRadians(from.latitude);
        const lonD = toRadians(to.longitude - from.longitude);

        const {acos, cos, sin} = Math;
        return acos(sin(latFrom) * sin(latTo) + cos(latFrom) * cos(latTo) * cos(lonD)) * meanEarthRadius;
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
        const userInterfaceRadius = 360; // points
        const from = ATAEngine.origin;
        const to = airplane;
        const radius = this.flightZones.notice;
        const scale = userInterfaceRadius / radius;
        const lat = toRadians(from.latitude);

        const {cos} = Math;

        // TODO: Replace magic numbers.
        const longitudeScale = (111415.13 * cos(lat)) - (94.55 * cos(3 * lat)) + (0.12 * cos(5 * lat));
        const latitudeScale = (111132.09 - (566.05 * cos(2 * lat)) + (1.20 * cos(4 * lat)) - (0.002 * cos(6 * lat)));

        const xDistance = (to.longitude - from.longitude) * longitudeScale;
        const yDistance = (to.latitude - from.latitude) * latitudeScale;

        const x = xDistance * scale + userInterfaceRadius;
        const y = yDistance * scale + userInterfaceRadius;

        return {x, y};
    }
}

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}
