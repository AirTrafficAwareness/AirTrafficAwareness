import requests
import json
import time
import math

## Assume distance between each degree of latitude is 69 miles
## Assume distance between each degree of longtitude is 69 miles
## 250 Knots == 281 mph,  700 Knots == 805 mph
## refresh rate once every second
## Test scenario travelling 700 knots past Newark Airport for 5 seconds
## assume range is 34.5 miles (.5 degree of lat/long), actual TCAS range is 40 miles

username = "tonditfk"
apiKey = "72434adcb4c9d96851acbe9085a23493ea1f5fdd"
fxmlUrl = "http://flightxml.flightaware.com/json/FlightXML2/"
latlow = 32.6895
lathigh = 44.6895
longlow = -120.1745
longhigh = -116.1745

def calculateRange():
    payload = ('{range lat ' + latlow + ' ' + lathigh + '}'and' {range lon ' + longlow + ' ' + longhigh + '}'and' {> gs 0}'and' {true inAir}'and' {= lastPositionTime ' + timestr + '}'and' {!= lastPositionTime 0}')
    try:
        response = requests.get(fxmlUrl + "SearchBirdseyeInFlight", params=payload, auth=(username, apiKey))
        print(response.json())
        decodedResponse = response.json()
        with open('TestCase1', "a") as file:
            file.write(json.dumps(decodedResponse, indent=2, sort_keys=True))


    except requests.exceptions.HTTPError as e:
        print(e)

for i in range(0,300):
    data = []
    t = 0.004
    delta = 1
    latlow = round(latlow + t,4)
    lathigh = round(lathigh + t,4)
    longlow = round(longlow + t,4)
    longhigh = round(longhigh + t,4)
    latlowstr = str(latlow)
    lathighstr = str(lathigh)
    longlowstr = str(longlow)
    longhighstr = str(longhigh)
    if i == 0:
        timet = math.floor(time.time()) - 10
        timestr = str(timet)


    query = ('query={range lat ' + latlowstr + ' ' + lathighstr + '} {range lon ' + longlowstr + ' ' + longhighstr + '} {true inAir} {> lastPositionTime ' + timestr + '}')
    try:
        response = requests.get(fxmlUrl + "SearchBirdseyeInFlight", params=query, auth=(username, apiKey))
        responser = response.json()
        decodedResponse = response.json()
        print(responser)
        if not str(responser).startswith("{'error"):
            for i in responser['SearchBirdseyeInFlightResult']['aircraft']:
                aircraft = {"identifier":i['type'],
                            "flightNumber":i['ident'],
                            "groundSpeed": i['groundspeed'],
                            "altitude":i['altitude'],
                            "latitude":i['latitude'],
                            "longitude":i['longitude'],
                            "lastUpdateDate":i['timestamp'],
                            "heading":i['heading']}
                data.append(aircraft)
                if i['timestamp'] > int(timestr):
                    timestr = str(i['timestamp'])

            # Heading Math   https://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
            X = math.cos(latlow) * math.sin(longhigh - longlow)
            Y = math.cos(lathigh) * math.sin(latlow) - math.sin(lathigh) * math.cos(latlow) * math.cos(longhigh - longlow)
            heading = math.atan2(X, Y) * 180 / (math.pi)
            heading = round(heading, 2)
            # Heading Math end
            data.append(
                {"identifier": 'TEST',
                 "flightNumber": 'TestAirplane',
                "groundSpeed": round(69*t*3600/delta,1),
                "altitude": 200,
                "longitude": round(((longlow + longhigh) / 2),5),
                "latitude": round(((lathigh + latlow) / 2),5),
                "lastUpdateDate": math.floor(time.time()),
                "heading": (heading)}
            )
            with open('TestCase1', "a") as file:
                file.write('\n' + json.dumps(data, indent=2, sort_keys=True))






    except requests.exceptions.HTTPError as e:
        print(e)
    time.sleep(delta)