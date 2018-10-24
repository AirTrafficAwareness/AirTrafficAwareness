import {AirplaneData} from "./airplane";

export abstract class ClientProtocol {
    public onClientConnected: (identifier: string) => void;
    public abstract send(airplanes: AirplaneData[]);
}
