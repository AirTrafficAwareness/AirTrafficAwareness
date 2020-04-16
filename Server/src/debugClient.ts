import {ClientProtocol} from "./clientProtocol";
import {Airplane} from "./airplane";

export class DebugClient extends ClientProtocol {

    send(airplanes: Airplane[]): void {
        console.debug('Send airplane data to client', airplanes);
    }

}
