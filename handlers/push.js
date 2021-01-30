const resUtils = require('../utils/response_utilities')
const { Worker } = require('worker_threads');

function push(req, res) {
    const worker = new Worker("./build/worker/notifier.js");
    worker.on('error', function (err) {
        console.log(err);
    })
    const id = workerHandler.startNewWorker(worker);
    console.log("thread with id "+id+" started");
    resUtils.responseStatus(res)
}

module.exports = {
    push
}