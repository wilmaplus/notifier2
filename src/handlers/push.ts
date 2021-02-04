/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {Request, Response} from "express";
import {responseStatus, errorResponse} from "../utils/response_utilities";
import {Handler} from "../worker/handler";
import {IIDApiClient} from "../client/iid/apiclient";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {getWorkerId} from "../worker/utils/idcalc";
const { Worker } = require('worker_threads');

export function push(req: Request, res: Response) {
    // Checking if necessary parameters exist
    if (req.body.session && req.body.server_url && req.body.iid_key) {
        let apiConfig = (global as any).apiSettings;
        // Clients
        let iidClient = new IIDApiClient(apiConfig.iidKey, apiConfig.iidUrl);
        let wilmaClient = new WilmaApiClient(req.body.server_url, req.body.session);
        let workerHandler = ((global as any).workerHandler as Handler);

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
                                    // TODO start
                                } else {
                                    // TODO check if push ID exists in DB (if not, add) and continue with successful response
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

function startWorkerThread() {
    const worker = new Worker("./worker/notifier.js", {});
    worker.on('error', (err: any) => {
        console.log(err);
    });
    const id = ((global as any).workerHandler as Handler).startNewWorker(worker);
    console.log("thread with id "+id+" started");
}