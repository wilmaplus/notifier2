 /*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";
 import {ExamSaveFile, NewsArticle, NewsSaveFile, ObservationsSaveFile, Query} from "./misc/types";
 import {WilmaHttpClient} from "../client/wilma/httpclient/http";
 import {WilmaApiClient} from "../client/wilma/apiclient";
 import {FCMApiClient} from "../client/fcm/apiclient";
 import {sendNotificationQueries} from "./utils/query_runner";
 import {PushKey} from "../db/models/push";
 import {Storage} from "../storage/storage";

export class NewsRoutine extends AbstractRoutine {
    static publicName="news"

    constructor(encryptionKey: string, sessionId: Buffer) {
        super(encryptionKey, sessionId, "news");
    }

    check(wilmaServer: string, wilmaSession: string, userId: number, userType: number): Promise<Query[]> {
        return new Promise<Query[]>((resolve, reject) => {
            // Completion function
            const complete = (news: NewsArticle[], queryList: Query[]) => {
                this.saveFile(new NewsSaveFile(news), AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).
                then(() => {
                    resolve(queryList)
                })
                    .catch(error => reject(error));
            }
            let wilmaClient = new WilmaApiClient(wilmaServer, wilmaSession);
            wilmaClient.getNews().then(news => {
                let userIdString = AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer));
                this.getContentHash(userIdString).then(hash => {
                    // If hashes are different, then proceed to load data (this is done to save memory)
                    if (hash != null) {
                        let contentHash = Storage.getContentHash(new NewsSaveFile(news));
                        if (!contentHash.equals(hash)) {
                            this.getFile(userIdString).then((content) => {
                                if (content != null) {
                                    let savedNews = (content as NewsSaveFile).news;
                                    // Query list
                                    let queryList: Query[] = [];
                                    // Iterating thru news fetched from Wilma
                                    for (let fetchedArticle of news) {
                                        let found = false;
                                        // Iterating thru news from save file
                                        for (let newsArticle of savedNews) {
                                            // If found from both
                                            if (newsArticle.Id == fetchedArticle.Id) {
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            // New news article
                                            queryList.push(new Query('notification',  this.name, fetchedArticle, userId, userType, wilmaServer, NewsRoutine.publicName));
                                        }
                                    }
                                    // If query list is empty, complete this promise
                                    /*if (queryList.length < 1)
                                        complete(news);
                                    else {
                                        sendNotificationQueries(queryList, keyMap, fcmClient)
                                            .then(() => {
                                                complete(news);
                                            })
                                            .catch(error => reject(error));
                                    }*/
                                    complete(news, queryList);
                                } else
                                    // If no content is saved, complete this promise
                                    complete(news, []);
                            }).catch(error => reject(error));
                        } else
                            complete(news, []);
                    } else
                        complete(news, []);
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }
}