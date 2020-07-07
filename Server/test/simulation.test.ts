import { Simulation } from "../src/simulation";
import assert from 'assert';


describe('Simulation', () => {
    context('Before Started', () => {
        it('Should have no simulation data', () => {
            const simulation = new Simulation();
            assert.strictEqual(simulation.data.length,0);
        });
    });
    context('When Started', () => {
        it('Should have simulation data', () => {
            const simulation = new Simulation();
            simulation.start();
            setInterval(() => {process.exit()}, 5000);
            assert.notEqual(simulation.data.length,0);
        });
    });
});