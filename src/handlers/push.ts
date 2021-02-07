/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {Request, Response} from "express";
import {responseStatus, errorResponse} from "../utils/response_utilities";
import {Handler} from "../worker/handler";
import {IIDApiClient} from "../client/iid/apiclient";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {getWorkerId} from "../worker/utils/idcalc";
import {Database} from "../db/db";
const { Worker } = require('worker_threads');

export function push(req: Request, res: Response) {
    // Checking if necessary parameters exist
    if (req.body.session && req.body.server_url && req.body.iid_key) {
        let apiConfig = (global as any).apiSettings;
        // Clients
        let iidClient = new IIDApiClient(apiConfig.iidKey, apiConfig.iidUrl);
        let wilmaClient = new WilmaApiClient(req.body.server_url, req.body.session);
        let workerHandler = ((global as any).workerHandler as Handler);
        let db = ((global as any).db as Database);

        wilmaClient.checkSession()
            .then(sessionInfo => {
                // Validating push key
                iidClient.getPushKeyDetails(req.body.iid_key)
                    .then(details => {
                        if (apiConfig.iidPackageName !== null) {
                            // Verify package name before continuing
                            if (details.application !== apiConfig.iidPackageName) {
                                responseStatus(res, 400, false, {cause: "iid_key is not trusted for this notifier!"});
                                return;
                            }
                        }
                        // Get worker ID
                        getWorkerId(sessionInfo.userId, sessionInfo.userType, req.body.server_url)
                            .then(id => {
                                if (!workerHandler.isWorkerRunning(id)) {
                                    db.keyExists(req.body.iid_key, id, contains => {
                                        if (contains) {
                                            startWorkerThread(id, req.body.server_url, req.body.session, db);
                                            responseStatus(res);
                                        } else {
                                            db.addPushKey(req.body.iid_key, id).then(() => {
                                                startWorkerThread(id, req.body.server_url, req.body.session, db);
                                                responseStatus(res);
                                            }).catch(error => {
                                                errorResponse(res, 500, error);
                                            })
                                        }
                                    });

                                } else {
                                    db.keyExists(req.body.iid_key, id, contains => {
                                        if (contains) {
                                            responseStatus(res);
                                        } else {
                                            db.addPushKey(req.body.iid_key, id).then(() => {
                                                responseStatus(res);
                                            }).catch(error => {
                                                errorResponse(res, 500, error);
                                            })
                                        }
                                    });
                                }
                            })
                            .catch(error => {
                                errorResponse(res, 500, error);
                            });
                    }).catch(error => {
                    errorResponse(res, 500, error);
                });
            })
            .catch(error => {
                errorResponse(res, 500, error);
            });
    } else {
        responseStatus(res, 400, false, {cause: "required parameters not found!"});
    }
}

const startWorkerThread = (id: string, serverUrl: string, session: string, db: Database) => {
    let path = "./worker/notifier.js";
    if ((global as any).debug)
        path = "./build/worker/notifier.js";
    const worker = new Worker(path, {
        workerData: {
            userId: id,
            serverUrl: serverUrl,
            session: session,
            dbConfig: db.config,
            apiSettings: (global as any).apiSettings,
            dataFolder: (global as any).dataFolder,
            lFN: process.env.LONG_FILENAMES
        }
    });
    worker.on('error', (err: any) => {
        console.log(err);
    });
    worker.on('message', (msg: any) => {
        console.log(msg);
    });
    (global as any).workerHandler.startNewWorker(worker, id);
    console.log("thread with id "+id+" started");
}
