import * as express from "express";
import {Request, Response} from "express";
import {DataSourceProtocol} from "./dataSourceProtocol";
import {ATAEngine} from "./engine";
import {ClientProtocol} from "./clientProtocol";
import {Dump1090} from "./dump1090";
import {OpenSky} from "./opensky";
// import {Simulation} from "./simulation";
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

        this.app.route('/').get((req: Request, res: Response) => {
            const latitude = req.query.latitude;
            const longitude = req.query.longitude;
            if (!latitude || !longitude) {
                res.status(400).json({error: {message: 'Query parameters `latitude` and `longitude` are required.'}});
                return;
            }
            ATAEngine.origin = req.query;
            res.json({ok: req.query});
        });
    }

    listen(port, callback?: Function) {
        const server = this.app.listen(port, callback);
        const clientListener: ClientProtocol = new WebSocketClient(server);
        const dataSource: DataSourceProtocol = new OpenSky(); // Dump1090();
        const engine = new ATAEngine();

        dataSource.onReceivedData = data => engine.determineProximity(data);
        clientListener.onClientConnected = airplane => ATAEngine.origin = airplane;
        engine.onGeneratedDistances = data => clientListener.send(data);

        dataSource.start();
        const t = new Topic();
        t.text;
        t.value;
        t.sentiment;
    }

}

export default new App();

class Topic {
    /// The tag or trending topic to be displayed in the app.
    text: string;
    /// The frequency of which this topic has occurred.
    value: number;
    /// The relative sentiment of this topic (min: -1, max: 1) -1 being all negative, +1 being all positive, 0 being neutral.
    sentiment: number;
}
