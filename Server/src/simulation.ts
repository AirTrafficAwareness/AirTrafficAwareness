import {DataSourceProtocol} from "./dataSourceProtocol";
import data1 from "./data/TestCase3.json";

export class Simulation extends DataSourceProtocol {
    started = false;
    data = [];
    count = 500;
    start(): void {
        if (this.started) {
            return;
        }
        console.log('starting simulation');
        this.data = data1;
        this.started = true;

        

        setInterval(() => {
            if (this.count < this.data.length) {
                console.log('batch', this.count + 1);
                const airplanes = this.data[this.count];
                this.onReceivedData(airplanes);
                this.count++;
            } else {
                this.started = false;
            }
        }, 5000);
    }
}
