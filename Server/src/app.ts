import * as express from "express";
import {Request, Response} from "express";
import {DataSourceProtocol} from "./dataSourceProtocol";
import {ATAEngine} from "./engine";
import {ClientProtocol} from "./clientProtocol";
import {Dump1090} from "./dump1090";
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
        const dataSource: DataSourceProtocol = new Dump1090();
        const engine = new ATAEngine();

        // console.log; for debugging
        dataSource.onReceivedData = data => engine.generateDistances(data);
        //dataSource.onReceivedData = console.log;
        clientListener.onClientConnected = airplane => engine.clientAirplane = airplane;
        engine.onGeneratedDistances = data => clientListener.send(data);

        this.app.route('/').get((req: Request, res: Response) => {
            dataSource.start();
            res.json({ok: req.query});
        });
    }

}

export default new App();
