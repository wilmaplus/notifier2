/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import express from 'express';
import bodyParser from "body-parser";
import {responseStatus} from "./utils/response_utilities";
import {Handler} from "./worker/handler";
import {push} from "./handlers/push";
import path from "path";

const PORT = process.env.PORT || 3001;

// Setting data folder
(global as any).dataFolder = path.join((process.env.DATA_FOLDER || path.dirname(__dirname)), ".wplus_data");

let app = express();
app.use(bodyParser.json());
// Outputs errors as JSON, not HTML
const jsonErrorHandler = async (err: any, req: any, res: any) => {
    responseStatus(res, 500, false, {cause: err.toString()});
}
app.use(jsonErrorHandler);

const workerHandler = new Handler();
((global as any).workerHandler) = workerHandler;

app.route('/api/v1/push').get(push);

app.get('*', (req, res) => {
    res.status(404).json({'status': false, 'cause': "not found"});
});

setInterval(function () {
    console.log(workerHandler.getRunningHandlerIDs())
}, 1000);
app.listen(PORT);