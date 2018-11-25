import {Airplane} from "./airplane";

export abstract class ClientProtocol {
    public onClientConnected: (airplane: Airplane) => void;
    public abstract send(airplanes: Airplane[]);
}
