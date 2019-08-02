import {DataSourceProtocol} from "./dataSourceProtocol";
import data1 from "./data/TestCase3.json";
import {ATAEngine} from "./engine";

export class Simulation extends DataSourceProtocol {
    started = false;

    start() {
        if (this.started) {
            return;
        }
        console.log('starting simulation');
        let data = data1;
        this.started = true;

        let count = 0;

        setInterval(() => {
            if (count < data.length) {
                console.log('batch', count + 1);
                const airplanes = data[count];
                this.onReceivedData(airplanes);
                count++;
            } else {
                this.started = false;
            }
        }, 5000);
    }
}