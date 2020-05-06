import {Airplane, Coordinate} from "./airplane";

interface ReceivedDataFunction {
    (airplanes: Airplane[]): void;
}

export abstract class DataSourceProtocol {
    public onReceivedData: ReceivedDataFunction = (() => {});
    public abstract start(origin: Coordinate)
}
