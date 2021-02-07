/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {FCMApiClient} from "../../client/fcm/apiclient";
import {AsyncIterator} from "../../asynciterator/iterator";
import {Query} from "../misc/types";

export function sendNotificationQueries(queries: Query[], pushIds: string[], fcmApi: FCMApiClient): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        new AsyncIterator((item, iterator) => {
            FCMApiClient.sendPush(pushIds, item)
                .then((result) => {
                    if (result.failureCount != result.successCount) {
                        console.log("Some devices failed to be sent: ");
                        console.log("Failed: "+result.failureCount);
                        console.log("Succeeded: "+result.successCount);
                    }
                    iterator.nextItem();
                })
                .catch((error) => reject(error));
        }, queries, () => {
            resolve();
        }).start();
    })
}
