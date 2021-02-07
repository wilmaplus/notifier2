/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {FCMApiClient} from "../client/fcm/apiclient";
import {WilmaHttpClient} from "../client/wilma/httpclient/http";
import {Exam, ExamSaveFile, Query} from "./misc/types";
import {sendNotificationQueries} from "./utils/query_runner";
import {PushKeys} from "../db/models/push";

export class ExamsRoutine extends AbstractRoutine {
    static publicName="exams"

    constructor(encryptionKey: string, sessionId: Buffer) {
        super(encryptionKey, sessionId, "exams");
    }

    check(wilmaServer: string, wilmaSession: string, pushIds: PushKeys[], userId: number, userType: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Completion function
            const complete = (exams: Exam[]) => {
                this.saveFile(new ExamSaveFile(exams), AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).
                then(() => {
                    resolve()
                })
                    .catch(error => reject(error));
            }
            // Filtering only keys which allowed this routine
            let keyMap: string[] = []; pushIds.forEach(item => {
                if (item.allowedRoutines.includes(ExamsRoutine.publicName))
                    keyMap.push(item.key);
            });
            let wilmaClient = new WilmaApiClient(wilmaServer, wilmaSession);
            let fcmClient = new FCMApiClient((global as any).apiSettings.fcmKey);
            wilmaClient.getExams().then(exams => {
                this.getFile(AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).then((content) => {
                    if (content != null) {
                        let savedExams = (content as ExamSaveFile).exams;
                        // Query list
                        let queryList: Query[] = [];
                        // Iterating thru exams fetched from Wilma
                        for (let fetchedExam of exams) {
                            let found = false;
                            let gradeChange = false;
                            // Iterating thru exams from save file
                            for (let exam of savedExams) {
                                // If found from both
                                if (exam.ExamId == fetchedExam.ExamId) {
                                    found = true;
                                    // If both of them have grades, only possibility is for grade to change
                                    // If only newly fetched exam has a grade, new grade got just published
                                    if (exam.Grade && fetchedExam.Grade) {
                                        gradeChange = (exam.Grade !== fetchedExam.Grade);
                                    } else if (fetchedExam.Grade) {
                                        gradeChange = true;
                                    }
                                    break;
                                }
                            }
                            if (!found) {
                                // New exam
                                queryList.push(new Query('notification',  this.name, fetchedExam, userId, userType, wilmaServer));
                            } else if (gradeChange) {
                                // Grade changed
                                queryList.push(new Query('notification',  this.name+"_grade", fetchedExam, userId, userType, wilmaServer));
                            }
                        }
                        // If query list is empty, complete this promise
                        if (queryList.length < 1)
                            complete(exams);
                        else {
                            sendNotificationQueries(queryList, keyMap, fcmClient)
                                .then(() => {
                                    complete(exams);
                                })
                                .catch(error => reject(error));
                        }
                    } else
                        // If no content is saved, complete this promise
                        complete(exams);
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }
}