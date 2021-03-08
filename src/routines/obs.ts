/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";
import {NewsSaveFile, Observation, ObservationsSaveFile, Query} from "./misc/types";
import {WilmaHttpClient} from "../client/wilma/httpclient/http";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {FCMApiClient} from "../client/fcm/apiclient";
import {sendNotificationQueries} from "./utils/query_runner";
import {PushKey} from "../db/models/push";
import {Storage} from "../storage/storage";

export class ObservationsRoutine extends AbstractRoutine {
    static publicName="observations"

    constructor(encryptionKey: string, sessionId: Buffer) {
        super(encryptionKey, sessionId, "observations");
    }

    check(wilmaServer: string, wilmaSession: string, userId: number, userType: number): Promise<Query[]> {
        return new Promise<Query[]>((resolve, reject) => {
            // Completion function
            const complete = (observations: Observation[], queryList: Query[]) => {
                this.saveFile(new ObservationsSaveFile(observations), AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).
                then(() => {
                    resolve(queryList)
                })
                    .catch(error => reject(error));
            }
            let wilmaClient = new WilmaApiClient(wilmaServer, wilmaSession);
            wilmaClient.getObservations().then(observations => {
                let userIdString = AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer));
                this.getContentHash(userIdString).then(hash => {
                    // If hashes are different, then proceed to load data (this is done to save memory)
                    if (hash != null) {
                        let contentHash = Storage.getContentHash(new ObservationsSaveFile(observations.observations));
                        if (!contentHash.equals(hash)) {
                            this.getFile(userIdString).then((content) => {
                                if (content != null) {
                                    let savedObservations = (content as ObservationsSaveFile).observations;
                                    // Query list
                                    let queryList: Query[] = [];
                                    // Iterating thru observations fetched from Wilma
                                    for (let fetchedObservation of observations.observations) {
                                        let found = false;
                                        // Iterating thru observations from save file
                                        for (let observation of savedObservations) {
                                            // If found from both
                                            if (observation.Id == fetchedObservation.Id) {
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            // New observation
                                            fetchedObservation.allowSaveExcuse = observations.allowedExcusesSaving;
                                            queryList.push(new Query('notification',  this.name, fetchedObservation, userId, userType, wilmaServer, ObservationsRoutine.publicName));
                                        }
                                    }
                                    // If query list is empty, complete this promise
                                    /*if (queryList.length < 1)
                                        complete(observations.observations);
                                    else {
                                        sendNotificationQueries(queryList, keyMap, fcmClient)
                                            .then(() => {
                                                complete(observations.observations);
                                            })
                                            .catch(error => reject(error));
                                    }*/
                                    complete(observations.observations, queryList);
                                } else
                                    // If no content is saved, complete this promise
                                    complete(observations.observations, []);
                            }).catch(error => reject(error));
                        } else
                            complete(observations.observations, []);
                    } else
                        complete(observations.observations, []);
                });
            }).catch(error => reject(error));
        });
    }
}