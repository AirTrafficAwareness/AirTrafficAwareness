import { ATAEngine } from "../src/engine";
import * as assert from 'assert';

describe('ATAEngine', () => {
    it('should calculate the distance between airplanes', () => {
        const engine = new ATAEngine();
        engine.myAircraft =  {
            identifier: 'BNA',
            latitude: 36.12,
            longitude: -86.67,
            lastUpdateDate: Date.now()
        };
        engine.onGeneratedDistances = airplanes => {
            console.log('airplanes', airplanes);
            assert.strictEqual(airplanes.length, 1);
            const lax = airplanes[0];
            assert.strictEqual(lax.identifier, 'LAX');
            assert(lax.distance >= 2886444.44283798329974715782394574671655);
            assert(lax.distance <= 2887259.95060711033944886005029688505340);
        };
        engine.generateDistances([
            {
                identifier: 'LAX',
                latitude: 33.94,
                longitude: -118.40,
                lastUpdateDate: Date.now()
            }
        ]);
    });
});
