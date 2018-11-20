import * as WebSocket from 'ws';
import {ClientProtocol} from "./clientProtocol";
import {AirplaneData} from "./airplane";
import {Application} from "express";
import * as http from "http";

export class WebSocketClient extends ClientProtocol {
    private client: WebSocket;

    constructor(app: Application) {
        super();
        const server = http.createServer(app);
        const wss = new WebSocket.Server({ server });
        wss.on('connection', (ws: WebSocket) => {

            ws.on('message', (message: string) => {
                console.debug('WebSocketClient received message:', message);

                const json = JSON.parse(message);
                if (json.identifier) {
                    this.client = ws;
                    this.onClientConnected(json.identifier);
                    ws.send(JSON.stringify({ok: {json}}));
                } else {
                    ws.send(JSON.stringify({error: {json}}));
                }
            });

            ws.send(JSON.stringify({ok: 'identify'}));
        });
    }

    send(airplanes: AirplaneData[]) {
        if (this.client && this.client.OPEN) {
            try {
                this.client.send(JSON.stringify(airplanes));
            } catch (e) {
                console.error('Error', e);
            }
        }
    }
}
