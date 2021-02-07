/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";
import {Observation, ObservationsSaveFile, Query} from "./misc/types";
import {WilmaHttpClient} from "../client/wilma/httpclient/http";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {FCMApiClient} from "../client/fcm/apiclient";
import {sendNotificationQueries} from "./utils/query_runner";
import {PushKeys} from "../db/models/push";

export class ObservationsRoutine extends AbstractRoutine {
    static publicName="observations"

    constructor(encryptionKey: string, sessionId: Buffer) {
        super(encryptionKey, sessionId, "observations");
    }

    check(wilmaServer: string, wilmaSession: string, pushIds: PushKeys[], userId: number, userType: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Completion function
            const complete = (observations: Observation[]) => {
                this.saveFile(new ObservationsSaveFile(observations), AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).
                then(() => {
                    resolve()
                })
                    .catch(error => reject(error));
            }
            // Filtering only keys which allowed this routine
            let keyMap: string[] = []; pushIds.forEach(item => {
                if (item.allowedRoutines.includes(ObservationsRoutine.publicName))
                    keyMap.push(item.key);
            });
            let wilmaClient = new WilmaApiClient(wilmaServer, wilmaSession);
            let fcmClient = new FCMApiClient((global as any).apiSettings.fcmKey);
            wilmaClient.getObservations().then(observations => {
                this.getFile(AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).then((content) => {
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
                                queryList.push(new Query('notification',  this.name, fetchedObservation, userId, userType, wilmaServer));
                            }
                        }
                        // If query list is empty, complete this promise
                        if (queryList.length < 1)
                            complete(observations.observations);
                        else {
                            sendNotificationQueries(queryList, keyMap, fcmClient)
                                .then(() => {
                                    complete(observations.observations);
                                })
                                .catch(error => reject(error));
                        }
                    } else
                        // If no content is saved, complete this promise
                        complete(observations.observations);
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }
}