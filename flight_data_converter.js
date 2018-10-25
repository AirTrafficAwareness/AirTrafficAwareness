function getDataFromDump1090(){
/*
	var url = http://IPAddress:8080/data/aircraft.json

	$.get(url, function (data) {
		return convert(data);
    });
*/
}

function convert(dump1090Data){
	var airplane = [];
	var airplaneList = [];
	jQuery.each(dump1090Date['aircraft'], function(i, val) {
		if(val['alt_geom'] != undefined){
			airplane = {};
			airplane["identifier"]= val['hex'];
			airplane["groundSpeed"] = val['gs'];
			airplane["altitude"] = val['alt_geom'];
			airplane["latitude"] = val['lat'];
			airplane["longitude"] = val['lon'];
			airplane["heading"] = val['track'];
			airplane["lastUpdateDate"] = dump1090Date['now'];
			airplaneList.push(airplane);
		}
	});
	var output = JSON.stringify(airplaneList);
   return output;
}