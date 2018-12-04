import {Airplane, Rectangle, Coordinate} from './airplane';

type CallbackFunction = (airplanes: Airplane[]) => void;
type FlightZones = { danger: number, caution: number, notice: number };

export class ATAEngine {
    public onGeneratedDistances: CallbackFunction = (() => {});
    static origin: Airplane;
    intersection: Airplane;
    ourDangerZone: Rectangle;
    incomingPlaneDangerZone: Rectangle;
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

    //**************************************************************************************** ddddddddddddddddddddd

    updateZones() {
        // TODO: Calculate zones based on velocity, or use proper heuristic values.
        const radius = 9260; // 5 nautical miles
        this.flightZones = {
            danger: radius,
            caution: radius * 2,
            notice: radius * 3,
        };
    }

    //**************************************************************************************** 

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

    calculateDistanceFromTo(from, to) {
        const meanEarthRadius = 6371e3; // meters

        const latTo = toRadians(to.latitude);
        const latFrom = toRadians(from.latitude);
        const lonD = toRadians(to.longitude - from.longitude);

        const {acos, cos, sin} = Math;
        return acos(sin(latFrom) * sin(latTo) + cos(latFrom) * cos(latTo) * cos(lonD)) * meanEarthRadius;
    }

    //**************************************************************************************** 

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

    //**************************************************************************************** 

    calculatePosition(airplane) {
        const userInterfaceRadius = 360; // points
        const from = ATAEngine.origin;
        const to = airplane;
        const radius = this.flightZones.notice;
        const scale = userInterfaceRadius / radius;
        const lat = toRadians(from.latitude);

        const {PI, cos, sin, acos} = Math;

        // TODO: Replace magic numbers.
        const longitudeScale = (111415.13 * cos(lat)) - (94.55 * cos(3 * lat)) + (0.12 * cos(5 * lat));
        const latitudeScale = (111132.09 - (566.05 * cos(2 * lat)) + (1.20 * cos(4 * lat)) - (0.002 * cos(6 * lat)));

        const xDistance = (to.longitude - from.longitude) * longitudeScale;
        const yDistance = (to.latitude - from.latitude) * latitudeScale;

        const x = xDistance * scale + userInterfaceRadius;
        const y = yDistance * scale + userInterfaceRadius;

        return {x, y};
    }

    calculatePositionRectangle(longitude, latitude, airplane ) {
        const userInterfaceRadius = 360; // points
        const from = airplane;
        const radius = this.flightZones.notice;
        const scale = userInterfaceRadius / radius;
        const lat = toRadians(from.latitude);

        const {PI, cos, sin, acos} = Math;

        // TODO: Replace magic numbers.
        const longitudeScale = (111415.13 * cos(lat)) - (94.55 * cos(3 * lat)) + (0.12 * cos(5 * lat));
        const latitudeScale = (111132.09 - (566.05 * cos(2 * lat)) + (1.20 * cos(4 * lat)) - (0.002 * cos(6 * lat)));

        const xDistance = (longitude - from.longitude) * longitudeScale;
        const yDistance = (latitude - from.latitude) * latitudeScale;

        const x = xDistance * scale + userInterfaceRadius;
        const y = yDistance * scale + userInterfaceRadius;

        return {
            x: x,
            y: y,
        };
    }

    //**************************************************************************************** 

    /**
     * This method is used to predict a potential collision for 2 airplanes.
     * @param ourAirplane The users airplane.
     * @param incomingAirplane The incoming airplane that could cause a problem.
     */
    predictPotentialCollision(ourAirplane, incomingAirplane) {
        

        
    }

    //**************************************************************************************** 
    
    /**
     * This method is used to get the point 2 miles left and right(horizontal) of the plane
     * and 12 seconds out from the plane.
     * @param ourAirplane The users airplane.
     */
    setAirplaneDangerPoints(airplane) {
        const {asin, sin, cos, PI} = Math;

        const SAFE_ZONE_TIME = 12; // Time in seconds to flag for potential collisons.
        const SAFE_ZONE_RADIUS = 2; // Distance in miles left and right of the plane that no one should enter.
        const degreeChangeLeft = -90;
        const degreeChangeRight = 90;

        const degreeLeft = this.getNewDegree(airplane.heading, degreeChangeLeft);
        const degreeRight = this.getNewDegree(airplane.heading, degreeChangeRight);
        var dangerPointsY = [];
        var dangerPointsX = [];
        var tempXY = {
            x: 0,
            y: 0,
        };

        // Get coordinates of bottom left corner

        // Get latitude 2 miles left of the plane
        var BottomLeftLat = asin(sin(airplane.latitude) * cos(SAFE_ZONE_RADIUS)
            + cos(airplane.latitude) * sin(SAFE_ZONE_RADIUS) * cos(degreeLeft));

        // Get longitute 2 miles left of the plane
        if (cos(airplane.latitude) == 0) {
            var BottomLeftLon = 0 // point is a pole
        } else {
            var BottomLeftLon = (airplane.longitude - asin(sin(degreeLeft) * sin(SAFE_ZONE_RADIUS) / cos(BottomLeftLat))
                + PI % 2 * PI ) - PI
        }

        tempXY = this.calculatePositionRectangle(BottomLeftLon, BottomLeftLat, airplane);
        dangerPointsX.push(tempXY.x);
        dangerPointsY.push(tempXY.y);



        // Get coordinates of bottom right corner
        var BottomRightLat = asin(sin(airplane.latitude) * cos(SAFE_ZONE_RADIUS)
            + cos(airplane.latitude) * sin(SAFE_ZONE_RADIUS) * cos(degreeRight));

        if (cos(airplane.latitude) == 0) {
            var BottomRightLon = 0
        } else {
            var BottomRightLon = (airplane.longitude - asin(sin(degreeRight) * sin(SAFE_ZONE_RADIUS) / cos(BottomRightLat))
                + PI % 2 * PI ) - PI
        }

        tempXY = this.calculatePositionRectangle(BottomRightLon, BottomRightLat, airplane);
        dangerPointsX.push(tempXY.x);
        dangerPointsY.push(tempXY.y);

        // Get coordinates of top left corner
        const distance12SecondsAway = this.getDistance(airplane.velocity, SAFE_ZONE_TIME);

        var TopLeftLat = asin(sin(BottomLeftLat) * cos(distance12SecondsAway)
            + cos(BottomLeftLat) * sin(distance12SecondsAway) * cos(airplane.heading));

        // Get longitute 2 miles left of the plane
        if (cos(BottomLeftLat) == 0) {
            var TopLeftLon = 0 // point is a pole
        } else {
            var TopLeftLon = (BottomLeftLon - asin(sin(airplane.heading) * sin(distance12SecondsAway) / cos(TopLeftLat))
                + PI % 2 * PI ) - PI
        }

        tempXY = this.calculatePositionRectangle(TopLeftLon, TopLeftLat, airplane);
        dangerPointsX.push(tempXY.x);
        dangerPointsY.push(tempXY.y);


        // Get coordinates of top right corner
        var TopRightLat = asin(sin(BottomRightLat) * cos(distance12SecondsAway)
            + cos(BottomRightLat) * sin(distance12SecondsAway) * cos(airplane.heading));

        // Get longitute 2 miles left of the plane
        if (cos(BottomRightLat) == 0) {
            var TopRightLon = 0 // point is a pole
        } else {
            var TopRightLon = (BottomRightLon - asin(sin(airplane.heading) * sin(distance12SecondsAway) / cos(TopRightLat))
                + PI % 2 * PI ) - PI
        }

        tempXY = this.calculatePositionRectangle(TopRightLon, TopRightLat, airplane);
        dangerPointsX.push(tempXY.x);
        dangerPointsY.push(tempXY.y);


        dangerPointsX.forEach((point, index) => {
            if (index = 0) {
                airplane.minimumXCoordinate = point;
                airplane.maximumXCoordinate = point;
            } else {

                if (point > airplane.maximumXCoordinate) {
                    airplane.maximumXCoordinate = point;
                } else if (point < airplane.minimumXCoordinate) {
                    airplane.minimumXCoordinate = point;
                }
            }
        });

        dangerPointsY.forEach((point, index) => {
            if (index = 0) {
                airplane.minimumYCoordinate = point;
                airplane.maximumYCoordinate = point;
            } else {

                if (point > airplane.maximumYCoordinate) {
                    airplane.maximumYCoordinate = point;
                } else if (point < airplane.minimumYCoordinate) {
                    airplane.minimumYCoordinate = point;
                }
            }
        });
    }

    //**************************************************************************************** 

    /**
     * This method is used to calculate a new degree given a current degree and a rotation amount
     * that should be less than 360 degrees.
     * @param currentDegree The degree the plane is currently heading.
     * @param degreeChange The degree amount to rotate the plane heading.
     * @returns Degree
     */
    getNewDegree(currentDegree, degreeChange) {
        const maxDegree = 360;
        var newDegree = currentDegree + degreeChange;
        
        if (newDegree < 0) {
            return maxDegree + newDegree;
        }
        return newDegree % maxDegree;
    }

    //**************************************************************************************** 

    /**
     * This method will calculate the distance away given a time and speed
     * @param velocity Speed in mph the plane is traveling
     * @param time Time is seconds the plane will travel
     * @returns The distance the plane will have to travel
     */
    getDistance(velocity, time) {
        return velocity * ((1 / 60) * (1 / 60) * time)
    }
    
    //**************************************************************************************** 
    
    /**
     * This method is used to determine if 2 different rectangles intersect each other.
     * @param rect1 
     * @param rect2 
     * @returns Flag indicating if the rectangles intersect.
     */
    doRectanglesIntersect(rect1, rect2) {
        return !(
            rect1.maximumXCoordinate > rect2.maximumXCoordinate || // if rect1 is left of rect2
            rect1.minimumXCoordinate < rect2.minimumXCoordinate || // if rect1 is right of rect2
            rect1.minimumYCoordinate > rect2.minimumYCoordinate || // if rect1 is above rect2
            rect1.maximumYCoordinate < rect2.maximumYCoordinate // if rect1 is below rect2
        );
    }

    //**************************************************************************************** 

    /**
     * This method is used to predict a simple potential collision for 2 airplanes by cross intersection.
     * @param ourAirplane The users airplane.
     * @param incomingAirplane The incoming airplane that could cause a problem.
     */
    calculateSimpleCollision(ourAirplane, incomingAirplane) {
        // Set lat/lon/heading to radians
        var φ1 = toRadians(ourAirplane.latitude), λ1 = toRadians(ourAirplane.longitude);
        var φ2 = toRadians(incomingAirplane.latitude), λ2 = toRadians(incomingAirplane.longitude);
        var θ13 = toRadians(Number(ourAirplane.heading)), θ23 = toRadians(Number(incomingAirplane.heading));
        var Δφ = φ2-φ1, Δλ = λ2-λ1;

        // angular distance p1-p2
        var δ12 = 2*Math.asin( Math.sqrt( Math.sin(Δφ/2)*Math.sin(Δφ/2)
            + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2) ) );
        if (δ12 == 0) return null;

        // initial/final bearings between points
        var θa = Math.acos( ( Math.sin(φ2) - Math.sin(φ1)*Math.cos(δ12) ) / ( Math.sin(δ12)*Math.cos(φ1) ) );
        if (isNaN(θa)) θa = 0; // protect against rounding
        var θb = Math.acos( ( Math.sin(φ1) - Math.sin(φ2)*Math.cos(δ12) ) / ( Math.sin(δ12)*Math.cos(φ2) ) );

        var θ12 = Math.sin(λ2-λ1)>0 ? θa : 2*Math.PI-θa;
        var θ21 = Math.sin(λ2-λ1)>0 ? 2*Math.PI-θb : θb;

        var α1 = θ13 - θ12; // angle 2-1-3
        var α2 = θ21 - θ23; // angle 1-2-3

        if (Math.sin(α1)==0 && Math.sin(α2)==0) return null; // infinite intersections
        if (Math.sin(α1)*Math.sin(α2) < 0) return null;      // ambiguous intersection

        var α3 = Math.acos( -Math.cos(α1)*Math.cos(α2) + Math.sin(α1)*Math.sin(α2)*Math.cos(δ12) );
        var δ13 = Math.atan2( Math.sin(δ12)*Math.sin(α1)*Math.sin(α2), Math.cos(α2)+Math.cos(α1)*Math.cos(α3) );
        var φ3 = Math.asin( Math.sin(φ1)*Math.cos(δ13) + Math.cos(φ1)*Math.sin(δ13)*Math.cos(θ13) );
        var Δλ13 = Math.atan2( Math.sin(θ13)*Math.sin(δ13)*Math.cos(φ1), Math.cos(δ13)-Math.sin(φ1)*Math.sin(φ3) );
        var λ3 = λ1 + Δλ13;

        // Set intersection("airplane" object) to calculate distance from the already created function
        this.intersection.latitude = (toDegrees(φ3));
        this.intersection.longitude = (toDegrees(λ3) + 540) % 360 - 180; // Normalise to -180 to + 180 degrees

        // Get distance to intersection from origin plane and incoming plane
        const originDistanceToIntersection = this.calculateDistance(this.intersection);
        const incomingDistanceToIntersection = this.calculateDistanceFromTo(incomingAirplane, this.intersection);

        // Get time to reach intersection for origin plane and incoming plane
        const originTimeToIntersection = this.calculateTimeToDistance(originDistanceToIntersection, ourAirplane.velocity);
        const incomingTimeToIntersection = this.calculateTimeToDistance(incomingDistanceToIntersection, incomingAirplane.velocity);

        // If the origin plane and incoming plane reach the intersection within 5 seconds of each other
        // then flag the plane as a potential collision.
        const timeTolerance = 5;
        if (Math.abs(originTimeToIntersection - incomingTimeToIntersection) <= timeTolerance) {
            
            // Create object to push onto the potential collision array for the origin plane
            const tempObject = {
                id: incomingAirplane.identifier,
                distanceAwayToPlane: this.calculateDistance(incomingAirplane),
                distanceAwayToCollision: originDistanceToIntersection,
                speed: incomingAirplane.velocity,
                heading: incomingAirplane.heading,
                estimatedTimeOfCollision: originTimeToIntersection
            }

            ATAEngine.origin.potentialCollisionList.push(tempObject);
        }
    }

    //**************************************************************************************** 

    /**
     * This method is used to calculate the time it takes to reach a specific distance given a velocity
     * @param distance Distance away
     * @param velocity Speed the object is moving
     * @returns The time to reach the distance
     */
    calculateTimeToDistance(distance, velocity) {
        return distance / velocity;
    }
}

// degrees to radians
function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

// Radians to degrees
function toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}
