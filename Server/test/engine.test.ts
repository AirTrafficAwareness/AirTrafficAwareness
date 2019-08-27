import { ATAEngine } from "../src/engine";
import assert from 'assert';

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
                assert(lax.proximity.distance >= 1558.5553147073344);
                assert(lax.proximity.distance <= 1558.9956536755456);
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

        it('should only calculate the distance between airplanes with valid latitudes', () => {
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
                assert.strictEqual(lax.proximity, undefined);
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

        it('should only calculate the distance between airplanes with valid longitudes', () => {
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
                assert.strictEqual(lax.proximity, undefined);
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
        it('should exclude airplanes when longitudes are invalid', () => {
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
                assert.strictEqual(lax.proximity, undefined);
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

        it('should exclude airplanes when latitudes are invalid', () => {
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
                assert.strictEqual(lax.proximity, undefined);
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

        it('should return danger when distance is slightly less than 3 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5,
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
                    latitude: 50,
                    longitude: 5,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5.077,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return caution when distance is slightly greater than 3 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5,
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
                    longitude: 5,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5.078,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return caution when distance is slightly less than 6 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5,
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
                    longitude: 5,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5.155,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return notice when distance is slightly greater than 6 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5,
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
                    longitude: 5,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5.156,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return notice when distance is slightly less than 9 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5,
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
                    longitude: 5,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5.233,
                    lastUpdateDate: Date.now()
                }
            ]);
        });

        it('should return safe when distance is slightly greater than 15 nautical miles', () => {
            const engine = new ATAEngine();
            ATAEngine.origin =  {
                identifier: 'BNA',
                latitude: 50,
                longitude: 5,
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
                    longitude: 5,
                    lastUpdateDate: Date.now()
                },
                {
                    identifier: 'LAX',
                    latitude: 50,
                    longitude: 5.234,
                    lastUpdateDate: Date.now()
                }
            ]);
        });
    });
});
