/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {FCMApiClient} from "../client/fcm/apiclient";
import {WilmaHttpClient} from "../client/wilma/httpclient/http";
import {Exam, ExamSaveFile} from "./misc/types";

export class ExamsRoutine extends AbstractRoutine {

    constructor(encryptionKey: string, sessionId: Buffer) {
        super(encryptionKey, sessionId, "exams");
    }

    check(wilmaServer: string, wilmaSession: string, pushIds: string[], userId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Completion function
            const complete = (exams: Exam[]) => {
                this.saveFile(new ExamSaveFile(exams), WilmaHttpClient.getDomainFromURL(wilmaServer), userId).
                then(() => {
                    resolve()
                })
                    .catch(error => reject(error));
            }
            let wilmaClient = new WilmaApiClient(wilmaServer, wilmaSession);
            let fcmClient = new FCMApiClient((global as any).apiSettings.fcmKey, (global as any).apiSettings.fcmUrl);
            wilmaClient.getExams().then(exams => {
                this.getFile(WilmaHttpClient.getDomainFromURL(wilmaSession), userId).then((content) => {
                    if (content != null) {
                        let savedExams = (content as ExamSaveFile).exams;
                        // Query list
                        let queryList = [];
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
                                queryList.push({'type': 'notification', 'data': this.name, 'payload': (fetchedExam as object)});
                            } else if (gradeChange) {
                                // Grade changed
                                queryList.push({'type': 'notification', 'data': this.name+"_grade", 'payload': (fetchedExam as object)});
                            }
                        }
                        // If query list is empty, complete this promise
                        if (queryList.length < 1)
                            complete(exams);
                        else {

                        }
                    } else
                        // If no content is saved, complete this promise
                        complete(exams);
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        })

    }
}
