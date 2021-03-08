/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {FCMApiClient} from "../client/fcm/apiclient";
import {WilmaHttpClient} from "../client/wilma/httpclient/http";
import {Exam, ExamSaveFile, Query} from "./misc/types";
import {sendNotificationQueries} from "./utils/query_runner";
import {PushKey} from "../db/models/push";
import {Storage} from "../storage/storage";

export class ExamsRoutine extends AbstractRoutine {
    static publicName="exams"

    constructor(encryptionKey: string, sessionId: Buffer) {
        super(encryptionKey, sessionId, "exams");
    }

    check(wilmaServer: string, wilmaSession: string, userId: number, userType: number): Promise<Query[]> {
        return new Promise<Query[]>((resolve, reject) => {
            // Completion function
            const complete = (exams: Exam[], queryList: Query[]) => {
                this.saveFile(new ExamSaveFile(exams), AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).
                then(() => {
                    resolve(queryList)
                })
                    .catch(error => reject(error));
            }
            let wilmaClient = new WilmaApiClient(wilmaServer, wilmaSession);
            wilmaClient.getExams().then(exams => {
                let userIdString = AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer));
                this.getContentHash(userIdString).then(hash => {
                    // If hashes are different, then proceed to load data (this is done to save memory)
                    if (hash != null) {
                        let contentHash = Storage.getContentHash(new ExamSaveFile(exams));
                        if (!contentHash.equals(hash)) {
                            console.log("Hash differs!");
                            this.getFile(userIdString).then((content) => {
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
                                            queryList.push(new Query('notification',  this.name, fetchedExam, userId, userType, wilmaServer, ExamsRoutine.publicName));
                                        } else if (gradeChange) {
                                            // Grade changed
                                            queryList.push(new Query('notification',  this.name+"_grade", fetchedExam, userId, userType, wilmaServer, ExamsRoutine.publicName));
                                        }
                                    }
                                    // If query list is empty, complete this promise
                                    /*if (queryList.length < 1)
                                        complete(exams, queryList);
                                    else {
                                        sendNotificationQueries(queryList, keyMap, fcmClient)
                                            .then(() => {
                                                complete(exams);
                                            })
                                            .catch(error => reject(error));
                                    }*/
                                    // Instead of pushing here, we're gonna gather all queries and send them later.
                                    complete(exams, queryList);
                                } else
                                    // If no content is saved, complete this promise
                                    complete(exams, []);
                            }).catch(error => reject(error));
                        } else
                            complete(exams, []);
                    } else
                        complete(exams, []);
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }
}