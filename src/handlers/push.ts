/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {Request, Response} from "express";
import {responseStatus, errorResponse} from "../utils/response_utilities";
import {Handler} from "../worker/handler";
import {IIDApiClient} from "../client/iid/apiclient";
import {ApiError, WilmaApiClient} from "../client/wilma/apiclient";
import {getWorkerId} from "../worker/utils/idcalc";
import {Database} from "../db/db";
import {getRoutineNames} from "../config/routines";
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
                        let routinesAllowed = getRoutineNames();
                        let customRoutinesDefined = false;
                        if (req.body.routines && Array.isArray(routinesAllowed)) {
                            if (req.body.routines.length > routinesAllowed.length) {
                                errorResponse(res, 400, new ApiError("Allowed routines array exceeds its maximum length!"));
                                return;
                            } else if (req.body.routines.length < 1) {
                                errorResponse(res, 400, new ApiError("Allowed routines array could not be empty!"));
                                return;
                            } else {
                                for (let item of req.body.routines) {
                                    if (!routinesAllowed.includes(item)) {
                                        errorResponse(res, 400, new ApiError("Allowed routines array contains invalid value!"));
                                        return;
                                    }
                                }
                            }
                            routinesAllowed = req.body.routines;
                            customRoutinesDefined = true;
                        }
                        // Get worker ID
                        getWorkerId(sessionInfo.userId, sessionInfo.userType, req.body.server_url)
                            .then(id => {
                                if (!workerHandler.isWorkerRunning(id)) {
                                    db.keyExists(req.body.iid_key, id, contains => {
                                        if (contains) {
                                            if (customRoutinesDefined) {
                                                db.updateAllowedRoutines(req.body.iid_key, id, routinesAllowed)
                                                    .then(() => {
                                                        startWorkerThread(id, req.body.server_url, req.body.session, db);
                                                        responseStatus(res);
                                                    })
                                                    .catch(error => {
                                                        errorResponse(res, 500, error);
                                                    });
                                            } else {
                                                startWorkerThread(id, req.body.server_url, req.body.session, db);
                                                responseStatus(res);
                                            }
                                        } else {
                                            db.addPushKey(req.body.iid_key, id, routinesAllowed).then(() => {
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
                                            if (customRoutinesDefined) {
                                                db.updateAllowedRoutines(req.body.iid_key, id, routinesAllowed)
                                                    .then(() => {
                                                        responseStatus(res);
                                                    })
                                                    .catch(error => {
                                                        errorResponse(res, 500, error);
                                                    });
                                            } else
                                                responseStatus(res);
                                        } else {
                                            db.addPushKey(req.body.iid_key, id, routinesAllowed).then(() => {
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
    if ((global as any).dev)
        path = "./build/worker/notifier.js";
    const worker = new Worker(path, {
        workerData: {
            userId: id,
            serverUrl: serverUrl,
            session: session,
            apiSettings: (global as any).apiSettings,
            dataFolder: (global as any).dataFolder,
            lFN: process.env.LONG_FILENAMES,
            debug: (global as any).debug,
            log: (global as any).log
        }
    });
    worker.on('error', (err: any) => {
        console.log(err);
    });
    worker.on('message', (msg: any) => {
        try {
            let data = JSON.parse(msg);
            if ((global as any).debug)
                console.log(data.request);
            switch (data.request) {
                case 'userKeys': {
                    let userId = data.params.userId;
                    db.getUserKeys(userId, data => {
                        worker.postMessage(JSON.stringify({type: 'userKeys', data: data}));
                    });
                    break;
                }
                default: {
                    if ((global as any).debug)
                        console.log("Got unrecognized command: "+data.request);
                }
            }
        } catch (e) {
            if ((global as any).debug)
                console.error(e);
        }
    });

    (global as any).workerHandler.startNewWorker(worker, id);
    console.log("thread with id "+id+" started");
}
