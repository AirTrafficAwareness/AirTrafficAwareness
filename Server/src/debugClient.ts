import {ClientProtocol} from "./clientProtocol";
import {Airplane} from "./airplane";

export class DebugClient extends ClientProtocol {

    send(airplanes: Airplane[]) {
        console.debug('Send airplane data to client', airplanes);
    }

}
