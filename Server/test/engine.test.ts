import { ATAEngine } from "../src/engine";
import * as assert from 'assert';

describe('ATAEngine', () => {
    context('when calculating distance', () => {
        it('should calculate the distance between airplanes', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -86.67,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance >= 2886444.44283798329974715782394574671655);
                assert(lax.proximity.distance <= 2887259.95060711033944886005029688505340);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 33.94,
                    longitude: -118.40,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    
        it('should calculate the distance between airplanes that have the same distance', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -86.67,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance == 0);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    
        it('should calculate the distance between airplanes that are very close with same lon, different lat', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.121121,
                longitude: -86.67,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance < 0.1);
                assert(lax.proximity.distance > 0);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.121121,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.121122,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    
        it('should calculate the distance between airplanes that are very close with same lat, different lat', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -86.67111,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance < 1);
                assert(lax.proximity.distance > 0);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -86.67111,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: -86.67112,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    
        it('should calculate the distance between airplanes that are so close the distance is the 0, while lon is lesser', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -86.671111111111111111,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance == 0);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -86.671111111111111111,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: -86.671111111111111112,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    
        it('should calculate the distance between airplanes that are so close the distance is the 0, while lon is greater', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -86.671111111111111111,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance == 0);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -86.671111111111111111,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: -86.671111111111111110,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    
        it('should calculate the distance between airplanes with inexistant latitudes', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: -105,
                longitude: -86.67,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance > 9999999);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: -105,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 105,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    
        it('should calculate the distance between airplanes with inexistant longitudes', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -250,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.distance > 9999999);
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -250,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: 250,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    });
    
    context('when calculating flight zone', () => {
        it('should return safe when longitudes are inexistant', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -250,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'safe');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -250,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: 250,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return safe when latitudes are inexistant', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: -105,
                longitude: -86.67,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'safe');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: -105,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 105,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return danger when distance is 0', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -86.67,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'danger');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: -86.67,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return danger when distance is close to 0', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 36.12,
                longitude: -86.67111,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'danger');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 36.12,
                    longitude: -86.67111,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 36.12,
                    longitude: -86.67112,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return caution when distance is slightly greater than 5 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5.12956,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'caution');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 50,
                    longitude: 5.12956,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return caution when distance is slightly less than 10 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5.26,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'caution');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 50,
                    longitude: 5.258,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return notice when distance is slightly greater than 10 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5.26,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'notice');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 50,
                    longitude: 5.26,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return notice when distance is slightly less than 15 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5.388,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'notice');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 50,
                    longitude: 5.388,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return safe when distance is slightly greater than 15 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5.39,
                lastUpdateDate: Date.now()
            };
            engine.onGeneratedDistances = airplanes => {
                assert.strictEqual(airplanes.length, 2);
                const lax = airplanes[1];
                assert.strictEqual(lax.identifier, 'LAX');
                assert(lax.proximity.flightZone === 'safe');
            };
            engine.determineProximity([
                {
                    identifier: 'BNA',
                    latitude: 50,
                    longitude: 5.39,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    });
});
