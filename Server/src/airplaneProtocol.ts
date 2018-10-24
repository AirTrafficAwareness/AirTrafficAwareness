import {Airplane} from "./airplane";

export abstract class AirplaneProtocol {
    public onReceivedData: (airplanes: Airplane[]) => void;
}
