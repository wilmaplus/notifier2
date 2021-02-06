/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import express from 'express';
import bodyParser from "body-parser";
import {responseStatus} from "./utils/response_utilities";
import {Handler} from "./worker/handler";
import {push} from "./handlers/push";
import path from "path";
import {Database} from "./db/db";
const rateLimit = require("express-rate-limit");

const DEBUG = process.env.DEBUG || false;
const PORT = process.env.PORT || 3001;
const BEHIND_PROXY = process.env.PROXY || false;
const FCM_KEY = process.env.FCM_KEY || null;
const IID_PKG_NAME = process.env.IID_PKGNAME || null;
const IID_KEY = process.env.IID_KEY || null;
const IID_URL = process.env.FCM_URL || "https://iid.googleapis.com";
console.log(process.env.DBCONFIG);
const DB_CONFIG = process.env.DBCONFIG || './dbconfig.json'
const dbConfig = require(DB_CONFIG);

if (FCM_KEY === null || IID_KEY === null) {
    throw new Error("FCM_KEY or IID_KEY not configured!");
}

// Setting logs to include timestamp
require('console-stamp')(console, '[HH:MM:ss.l]');

// Config
(global as any).apiSettings = {fcmKey: FCM_KEY, iidKey: IID_KEY, iidUrl: IID_URL, iidPackageName: IID_PKG_NAME};
(global as any).debug = DEBUG;

// Setting data folder
(global as any).dataFolder = path.join((process.env.DATA_FOLDER || path.dirname(__dirname)), ".wplus_data");

(global as any).db = new Database(dbConfig.dbname, dbConfig.username, dbConfig.password, dbConfig.host);
let db = (global as any).db as Database;
let app = express();
app.use(bodyParser.json());

// Rate-limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

// Behind proxy
if (BEHIND_PROXY)
    app.set('trust proxy', 1);

// only apply to requests that begin with /api/
app.use("/api/v1/", apiLimiter);

const workerHandler = new Handler();
((global as any).workerHandler) = workerHandler;

app.route('/api/v1/push').post(push);

app.get('*', (req, res) => {
    res.status(404).json({'status': false, 'cause': "not found"});
});

// Outputs errors as JSON, not HTML
const jsonErrorHandler = async (err: any, req: any, res: any, next: any) => {
    responseStatus(res, 500, false, {cause: err.toString()});
}
app.use(jsonErrorHandler);


console.log("Connecting to database");
db.connect().then(() => {
    setInterval(function () {
        console.log(workerHandler.getRunningHandlerIDs())
    }, 5000);
    app.listen(PORT);
});
