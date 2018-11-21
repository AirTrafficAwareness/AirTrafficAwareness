import * as express from "express";
import {Request, Response} from "express";
import {DataSourceProtocol} from "./dataSourceProtocol";
import {ATAEngine} from "./engine";
import {ClientProtocol} from "./clientProtocol";
import {Dump1090} from "./dump1090";
import {OpenSky} from "./opensky";
import {WebSocketClient} from "./webSocketClient";

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void {
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    }

    listen(port, callback?: Function) {
        const server = this.app.listen(port, callback);
        const clientListener: ClientProtocol = new WebSocketClient(server);
        const dataSource: DataSourceProtocol = new OpenSky();
        const engine = new ATAEngine();

        dataSource.onReceivedData = data => engine.determineProximity(data);
        clientListener.onClientConnected = airplane => ATAEngine.origin = airplane;
        engine.onGeneratedDistances = data => clientListener.send(data);

        this.app.route('/').get((req: Request, res: Response) => {
            const latitude = req.query.latitude;
            const longitude = req.query.longitude;
            if (!latitude || !longitude) {
                res.status(400).json({error: {message: 'Query parameters `latitude` and `longitude` are required.'}});
                return;
            }
            ATAEngine.origin = req.query;
            dataSource.start();
            res.json({ok: req.query});
        });
    }

}

export default new App();
