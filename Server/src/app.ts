import {AddressInfo} from "net";
import express, {Request, Response} from "express";
import path from "path";

import {ATAEngine} from "./engine";
import {ClientProtocol} from "./clientProtocol";
import {DataSourceProtocol} from "./dataSourceProtocol";

import {Dump1090} from "./dump1090";
import {Dump1090Stream} from "./dump1090Stream";
import {OpenSky} from "./opensky";
import {Simulation} from "./simulation";

import {WebSocketClient} from "./webSocketClient";
import {DebugClient} from "./debugClient";

import config, {Client, DataSource} from "./config";
import http from "http";

/*
Here you will find the driving code for the application, it runs the engine and wraps it around express
code used to communicate to the client.
 */
class App {

    readonly www = path.join(__dirname, '../www');
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void {
        this.app.use(express.static(this.www));

        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    }

    private static getDataSource(): DataSourceProtocol {
        switch (config.dataSource) {
            case DataSource.Dump1090:
                return new Dump1090();
            case DataSource.OpenSky:
                return new OpenSky();
            case DataSource.Stream:
                return new Dump1090Stream();
            case DataSource.Simulation:
                return new Simulation();
        }
    }

    private static getClient(server: http.Server): ClientProtocol {
        switch (config.client) {
            case Client.WebSocket:
                return new WebSocketClient(server);
            case Client.Debug:
                return new DebugClient(server);
        }

    }

    listen(port: number, callback?: AppCallback): void {
        const server = this.app.listen(port, 'localhost', () => {
            const address = server.address();
            if (typeof address === "string") {
                callback(null);
            } else {
                callback(address);
            }
        });
        const clientListener: ClientProtocol = App.getClient(server);
        const dataSource: DataSourceProtocol = App.getDataSource();
        const engine = new ATAEngine();

        dataSource.onReceivedData = (data): void => {
            engine.determineProximity(data)
        };
        clientListener.onClientConnected = (airplane): void => {
            ATAEngine.origin = airplane
        };
        engine.onGeneratedDistances = (data): void => {
            clientListener.send(data)
        };
        this.app.route('/api/').get((req: Request, res: Response) => {
            const identifier = req.query.identifier as string;
            const latitude = parseFloat(req.query.latitude as string);
            const longitude = parseFloat(req.query.longitude as string);
            if (!latitude || !longitude) {
                res.status(400).json({ error: { message: 'Query parameters `latitude` and `longitude` are required.' } });
                return;
            }
            ATAEngine.origin = { identifier, latitude, longitude, lastUpdateDate: Date.now() };
            res.json({ ok: req.query });
            dataSource.start();
        });

        this.app.get('*', (req, res) => {
            res.sendFile(path.join(this.www, 'index.html'));
        });
    }
}

interface AppCallback {
    (address: AddressInfo): void;
}

export default new App();
