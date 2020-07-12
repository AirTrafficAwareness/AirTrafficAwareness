import { Dump1090Stream } from "../src/dump1090Stream";
import assert from 'assert';
describe('Dump1090Stream', () => {
    context('When receiving data', () => {
        it('Should have a Datasource URL', () => {
            const dump1090Stream = new Dump1090Stream();
            assert.notEqual(dump1090Stream.url, '');
        });
        it('Should have a client connected', () => {
            const dump1090Stream = new Dump1090Stream();
            assert.equal(dump1090Stream.client,undefined);
            dump1090Stream.start();
            setInterval(() => {process.exit()}, 1000);
            assert.notEqual(dump1090Stream.client,undefined);
            dump1090Stream.airplaneData = {};
        });
        it('Should have airplanes', () => {
            const dump1090Stream = new Dump1090Stream();
            dump1090Stream.start();
            setInterval(() => {process.exit()}, 1000);
            assert.notEqual(dump1090Stream.airplaneData,undefined);
            assert.notEqual(dump1090Stream.airplaneData,{});
        });
    });
});
