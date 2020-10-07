import { Dump1090 } from "../src/dump1090";
import assert from 'assert';

describe('Dump1090', () => {
    context('When receiving data', () => {
        it('Should have a Datasource URL', () => {
            const dump1090 = new Dump1090();
            assert.notEqual(dump1090.url, '');

        });
        it('Should convert correctly', () => {
            
            const dump1090 = new Dump1090();
            const expected = {
                identifier: 'ABCDE',
                flightNumber: 'N127FR',
                groundSpeed: 100,
                altitude: 1000,
                latitude: 36.12,
                longitude: -86.67,
                heading: 180, 
            }
            const actual = dump1090.convert([{
                hex: 'ABCDE',
                squawk: '1200',
                flight: 'N127FR',
                lat: 36.12,
                lon: -86.67,
                alt_baro: 1000,
                track: 180, 
                gs: 100,
                seen: 1
            }])
            assert.strictEqual(actual.length,1);
            assert.strictEqual(actual[0].identifier, expected.identifier);
            assert.strictEqual(actual[0].flightNumber, expected.flightNumber);
            assert.strictEqual(actual[0].groundSpeed, expected.groundSpeed);
            assert.strictEqual(actual[0].altitude, expected.altitude);
            assert.strictEqual(actual[0].latitude, expected.latitude);
            assert.strictEqual(actual[0].longitude, expected.longitude);
            assert.strictEqual(actual[0].heading, expected.heading); 
        });
        it('Should return empty when no flight number is received', () => {
            const dump1090 = new Dump1090();
            const airplane = {
                hex: 'ABCDE',
                squawk: '1200',
                flight: '',
                lat: 36.12,
                lon: -86.67,
                alt_baro: 1000,
                track: 180, 
                gs: 100,
                seen: 1
            }; 
            const actual = dump1090.convert([airplane])
            assert.strictEqual(actual.length,0);
        });
    });
});
