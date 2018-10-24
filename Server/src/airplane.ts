
export interface Airplane {
    identifier: string;
    flightNumber: string;
    groundSpeed: number;
    altitude: number;
    latitude: number;
    longitude: number;
    lastUpdateDate: number;
}

export interface AirplaneData extends Airplane{
    distance: number;
    flightZone: string;
}
