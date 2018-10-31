import * as express from "express";
import {Request, Response} from "express";
import {AirplaneProtocol} from "./airplaneProtocol";
import {TcasEngine} from "./engine";
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

        const clientListener: ClientProtocol = new WebSocketClient(this.app);
        const dataSource: AirplaneProtocol = new Dump1090();
        const engine = new TcasEngine();

        // console.log; for debugging
        dataSource.onReceivedData = engine.generateDistances;
        //dataSource.onReceivedData = console.log;
        clientListener.onClientConnected = engine.setClentAirplaneIdenifier;
        engine.onGeneratedDistances = clientListener.send;

        this.app.route('/').get((req: Request, res: Response) => {
            dataSource.start();
            res.status(200).json({
                webSocketPort: 8999
            });
        });
    }

}

export default new App().app;
