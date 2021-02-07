 /*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";
 import {NewsArticle, NewsSaveFile, ObservationsSaveFile, Query} from "./misc/types";
 import {WilmaHttpClient} from "../client/wilma/httpclient/http";
 import {WilmaApiClient} from "../client/wilma/apiclient";
 import {FCMApiClient} from "../client/fcm/apiclient";
 import {sendNotificationQueries} from "./utils/query_runner";
 import {PushKeys} from "../db/models/push";

export class NewsRoutine extends AbstractRoutine {
    static publicName="news"

    constructor(encryptionKey: string, sessionId: Buffer) {
        super(encryptionKey, sessionId, "news");
    }

    check(wilmaServer: string, wilmaSession: string, pushIds: PushKeys[], userId: number, userType: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Completion function
            const complete = (news: NewsArticle[]) => {
                this.saveFile(new NewsSaveFile(news), AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).
                then(() => {
                    resolve()
                })
                    .catch(error => reject(error));
            }
            // Filtering only keys which allowed this routine
            let keyMap: string[] = []; pushIds.forEach(item => {
                if (item.allowedRoutines.includes(NewsRoutine.publicName))
                    keyMap.push(item.key);
            });
            let wilmaClient = new WilmaApiClient(wilmaServer, wilmaSession);
            let fcmClient = new FCMApiClient();
            wilmaClient.getNews().then(news => {
                this.getFile(AbstractRoutine.getUserIdString(userId, userType, WilmaHttpClient.getDomainFromURL(wilmaServer))).then((content) => {
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
                                queryList.push(new Query('notification',  this.name, fetchedArticle, userId, userType, wilmaServer));
                            }
                        }
                        // If query list is empty, complete this promise
                        if (queryList.length < 1)
                            complete(news);
                        else {
                            sendNotificationQueries(queryList, keyMap, fcmClient)
                                .then(() => {
                                    complete(news);
                                })
                                .catch(error => reject(error));
                        }
                    } else
                        // If no content is saved, complete this promise
                        complete(news);
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }
}