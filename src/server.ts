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
const FCM_KEY = process.env.FCM_KEY || null;
const IID_KEY = process.env.IID_KEY || null;
const FCM_URL = process.env.FCM_URL || "https://fcm.googleapis.com";
const IID_URL = process.env.FCM_URL || "https://iid.googleapis.com";

if (FCM_KEY === null || IID_KEY === null) {
    throw new Error("FCM_KEY or IID_KEY not configured!");
}

// Config
(global as any).apiSettings = {fcmKey: FCM_KEY, iidKey: IID_KEY, fcmUrl: FCM_URL, iidUrl: IID_URL};

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