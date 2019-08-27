import json from '../config.json';

export enum DataSource {
    Dump1090 = 'dump1090',
    OpenSky = 'openSky',
    Simulation = 'simulation',
    Stream = 'stream'
}

export enum Client {
    WebSocket = 'webSocket',
    Debug = 'debug',
}


interface BaseOptions {
    client: Client;
    port: number;
    launchOptions?: any
}

interface Dump1090Options extends BaseOptions {
    dataSource: DataSource.Dump1090;
    url?: string;
}

interface OpenSkyOptions extends BaseOptions {
    dataSource: DataSource.OpenSky;
    credentials?: {
        username: string;
        password: string;
    };
}

interface SimulationOptions extends BaseOptions {
    dataSource: DataSource.Simulation;
}

interface StreamOptions extends BaseOptions {
    dataSource: DataSource.Stream;
    url: string;
}

type Options = Dump1090Options | OpenSkyOptions | SimulationOptions | StreamOptions;

const defaults: Options = {
    dataSource: DataSource.Dump1090,
    client: Client.WebSocket,
    port: 3000
};


export default Object.assign(defaults, json) as Options;
