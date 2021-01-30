const express = require('express');
const bodyParser = require("body-parser");
const handler = require('./build/worker/handler');
const resUtils = require('./utils/response_utilities')

const pushHandler = require('./handlers/push')
app = express();
app.use(bodyParser.json());
// Outputs errors as JSON, not HTML
const jsonErrorHandler = async (err, req, res, next) => {
    resUtils.responseStatus(res, 500, false, {cause: err.toString()});
}
app.use(jsonErrorHandler)

const workerHandler = new handler.Handler();
global.workerHandler = workerHandler;

app.route('/api/v1/push').get(pushHandler.push)


app.get('*', function(req, res){
    res.status(404).json({'status': false, 'cause': "not found"});
});

setInterval(function () {
    console.log(workerHandler.getRunningHandlerIDs())
}, 1000);
app.listen(3001)