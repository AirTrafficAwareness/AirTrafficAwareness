import app from "./app";
import open from 'open';
import config from "./config";
const mdns = require('mdns');

app.listen(config.port, address => {
    if (config.launchOptions) {
        console.log('Launching Client');
        open(`http://${address.address}:${address.port}`, config.launchOptions).then(res => {
            console.log('res', res);
        }).catch(err => {
            console.error('err', err);
        })
    } else {
        console.log('Listening on port', config.port);
    }

    const ad = mdns.createAdvertisement(mdns.tcp('ata-server'), config.port, {name: 'Air Traffic Awareness'});
    ad.start();
});
