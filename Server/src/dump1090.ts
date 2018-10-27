import {Airplane} from './airplane';
import {AirplaneProtocol} from './airplaneProtocol';
import * as request from 'request'


export class Dump1090 extends AirplaneProtocol {

    constructor(callback) {
        super();
        this.onReceivedData = callback;
        //this.onReceivedData([]);
        //Dump1090 device ip address
       request('http://192.168.1.18:8080/data/aircraft.json',{json:true},(err,res,body)=>{
                console.log(body);
                this.onReceivedData(this.convert(body));
           //this.onReceivedData("{[key:value],[key2:value2]}");
       });
    }

    public convert(dump1090Data) {

        let airplane = {};
        let airplaneList = [];
        if(!Array.isArray(dump1090Data)){
            return [];
        }

        dump1090Data.forEach(function (val,i) {
            if (val['alt_geom'] != undefined) {

                airplane["identifier"] = val['hex'];
                airplane["groundSpeed"] = val['gs'];
                airplane["altitude"] = val['alt_geom'];
                airplane["latitude"] = val['lat'];
                airplane["longitude"] = val['lon'];
                airplane["heading"] = val['track'];
                airplane["lastUpdateDate"] = dump1090Data['now'];
                airplaneList.push(airplane);
            }
        });
        //var output = JSON.stringify(airplaneList);
       return airplaneList;
    }

}