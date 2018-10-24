import * as WebSocket from 'ws';
import {ClientProtocol} from "./clientProtocol";
import {AirplaneData} from "./airplane";

class WebSocketClient extends ClientProtocol {
    private client: WebSocket;

    send(airplanes: AirplaneData[]) {
        this.client.send(JSON.stringify(airplanes));
    }
}
