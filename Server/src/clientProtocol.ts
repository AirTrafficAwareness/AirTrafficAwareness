import {Airplane} from "./airplane";
import {Server} from "net";

export abstract class ClientProtocol {
    constructor(private server: Server) {}
    public onClientConnected: (airplane: Airplane) => void;
    public abstract send(airplanes: Airplane[]);
}
