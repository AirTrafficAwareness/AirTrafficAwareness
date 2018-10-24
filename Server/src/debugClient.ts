import {ClientProtocol} from "./clientProtocol";
import {AirplaneData} from "./airplane";

export class DebugClient extends ClientProtocol {

    send(airplanes: AirplaneData[]) {
        console.debug('Send airplane data to client', airplanes);
    }

}
