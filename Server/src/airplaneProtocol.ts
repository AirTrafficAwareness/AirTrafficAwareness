import {Airplane} from "./airplane";

interface ReceivedDataFunction {
    (airplanes: Airplane[]): void;
}

export abstract class AirplaneProtocol {
    public onReceivedData: ReceivedDataFunction = (() => {});
    public start() {}
}
