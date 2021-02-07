/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {Request, Response} from "express";
import {IIDApiClient} from "../client/iid/apiclient";
import {ApiError, WilmaApiClient} from "../client/wilma/apiclient";
import {Handler} from "../worker/handler";
import {Database} from "../db/db";
import {errorResponse, responseStatus} from "../utils/response_utilities";
import {getWorkerId} from "../worker/utils/idcalc";
import {Storage} from "../storage/storage";
import {getRoutineNames} from "../config/routines";
import {AsyncIterator} from "../asynciterator/iterator";
import {WilmaHttpClient} from "../client/wilma/httpclient/http";
import {AbstractRoutine} from "../routines/abstract";

export function remove(req: Request, res: Response) {
    if (req.body.session && req.body.server_url && req.body.iid_key) {
        // Clients
        let wilmaClient = new WilmaApiClient(req.body.server_url, req.body.session);
        let workerHandler = ((global as any).workerHandler as Handler);
        let db = ((global as any).db as Database);

        wilmaClient.checkSession()
            .then(sessionInfo => {
                getWorkerId(sessionInfo.userId, sessionInfo.userType, req.body.server_url)
                    .then(id => {
                        db.keyExists(req.body.iid_key, id, exists => {
                            if (exists) {
                                db.removePushKey(req.body.iid_key, id)
                                    .then(() => {
                                        db.getUserKeys(id, items => {
                                            if (items.length < 1 && workerHandler.isWorkerRunning(id)) {
                                                workerHandler.stopWorker(id);
                                                new AsyncIterator((routine, iterator) => {
                                                    Storage.removeSavedData(routine, AbstractRoutine.getUserIdString(sessionInfo.userId, sessionInfo.userType, WilmaHttpClient.getDomainFromURL(req.body.server_url)))
                                                        .then(() => {
                                                            iterator.nextItem();
                                                        })
                                                        .catch(error => {
                                                            errorResponse(res, 500, error);
                                                        });
                                                }, getRoutineNames(), () => {
                                                    responseStatus(res);
                                                }).start();
                                            } else {
                                                responseStatus(res);
                                            }
                                        });
                                    })
                                    .catch(error => {
                                        errorResponse(res, 500, error);
                                    });
                            } else {
                                errorResponse(res, 404, new ApiError("iid_key does not exist"));
                            }
                        })
                    })
                    .catch(error => {
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