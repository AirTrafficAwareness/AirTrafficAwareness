
export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Proximity {
    distance: number;
    flightZone: string;
    position: Point;
}

export interface PotentialCollision {
    id: string;
    distanceAwayToPlane: number;
    distanceAwayToCollision: number;
    speed: number;
    heading: number;
    estimatedTimeOfCollision: number;
}

export interface Airplane extends Coordinate, Rectangle {
    identifier: string;
    flightNumber?: string;
    groundSpeed?: number;
    altitude?: number;
    latitude: number;
    longitude: number;
    heading?: number;
    lastUpdateDate: number;
    potentialCollisionList: PotentialCollision[];
    proximity?: Proximity;
}

export interface Rectangle {
    minimumXCoordinate: number;
    maximumXCoordinate: number;
    minimumYCoordinate: number;
    maximumYCoordinate: number;
}
