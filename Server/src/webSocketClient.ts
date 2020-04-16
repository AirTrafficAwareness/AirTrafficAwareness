import WebSocket from 'ws';
import {ClientProtocol} from "./clientProtocol";
import {Airplane} from "./airplane";
import http from "http";

export class WebSocketClient extends ClientProtocol {
    private client: WebSocket;

    constructor(server: http.Server) {
        super(server);
        const wss = new WebSocket.Server({ server });
        wss.on('connection', (ws: WebSocket) => {
            this.client = ws;
            ws.on('message', (message: string) => {
                console.debug('WebSocketClient received message:', message);

                const json = JSON.parse(message);
                if (json.identifier) {
                    this.onClientConnected(json);
                    ws.send(JSON.stringify({ ok: { json } }));
                } else {
                    ws.send(JSON.stringify({ error: { json } }));
                }
            });

            ws.send(JSON.stringify({ ok: 'identify' }));
        });
    }

    send(airplanes: Airplane[]): void {
        if (this.client && this.client.OPEN) {
            try {
                this.client.send(JSON.stringify(airplanes));
            } catch (e) {
                this.client = null;
                console.error('Error', e);
            }
        }
    }
}
