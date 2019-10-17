const request = require('request');
const sender = url => {
    request({
        uri: url,
        method: 'GET'
    }, (error, response, body) => console.log(body));
}
module.exports = sender;