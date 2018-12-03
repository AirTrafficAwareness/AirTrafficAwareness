"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ATAEngine = /** @class */ (function () {
    function ATAEngine() {
        this.onGeneratedDistances = (function () { });
    }
    ATAEngine.prototype.determineProximity = function (airplanes) {
        var _this = this;
        if (!ATAEngine.origin) {
            return airplanes;
        }
        if (ATAEngine.origin.identifier) {
            var updated = airplanes.find(function (airplane) { return airplane.identifier === ATAEngine.origin.identifier; });
            if (updated) {
                ATAEngine.origin = updated;
                this.updateZones();
            }
        }
        if (!this.flightZones) {
            this.updateZones();
        }
        airplanes.forEach(function (airplane) {
            var distance = _this.calculateDistance(airplane);
            var flightZone = _this.calculateFlightZone(distance);
            var position = _this.calculatePosition(airplane);
            airplane.proximity = { distance: distance, flightZone: flightZone, position: position };
        });
        this.onGeneratedDistances(airplanes);
    };
    ATAEngine.prototype.updateZones = function () {
        // TODO: Calculate zones based on velocity, or use proper heuristic values.
        var radius = 9260 * 3; // 5 nautical miles
        this.flightZones = {
            danger: radius,
            caution: radius * 2,
            notice: radius * 3,
        };
    };
    ATAEngine.prototype.calculateDistance = function (airplane) {
        var meanEarthRadius = 6371e3; // meters
        var from = ATAEngine.origin;
        var to = airplane;
        var latTo = toRadians(to.latitude);
        var latFrom = toRadians(from.latitude);
        var lonD = toRadians(to.longitude - from.longitude);
        var acos = Math.acos, cos = Math.cos, sin = Math.sin;
        return acos(sin(latFrom) * sin(latTo) + cos(latFrom) * cos(latTo) * cos(lonD)) * meanEarthRadius;
    };
    ATAEngine.prototype.calculateFlightZone = function (distance) {
        var _a = this.flightZones, danger = _a.danger, caution = _a.caution, notice = _a.notice;
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
    };
    ATAEngine.prototype.calculatePosition = function (airplane) {
        var userInterfaceRadius = 360; // points
        var from = ATAEngine.origin;
        var to = airplane;
        var radius = this.flightZones.notice;
        var scale = userInterfaceRadius / radius;
        var lat = toRadians(from.latitude);
        var cos = Math.cos;
        // TODO: Replace magic numbers.
        var longitudeScale = (111415.13 * cos(lat)) - (94.55 * cos(3 * lat)) + (0.12 * cos(5 * lat));
        var latitudeScale = (111132.09 - (566.05 * cos(2 * lat)) + (1.20 * cos(4 * lat)) - (0.002 * cos(6 * lat)));
        var xDistance = (to.longitude - from.longitude) * longitudeScale;
        var yDistance = (to.latitude - from.latitude) * latitudeScale;
        var x = xDistance * scale + userInterfaceRadius;
        var y = yDistance * scale + userInterfaceRadius;
        return { x: x, y: y };
    };
    return ATAEngine;
}());
exports.ATAEngine = ATAEngine;
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}
