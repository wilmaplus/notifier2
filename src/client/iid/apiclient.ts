/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {FCMApiClient} from "../fcm/apiclient";
import {IIDHttpClient} from "./httpclient/http";

export class IIDApiClient {
    httpClient: IIDHttpClient

    constructor(apiKey: string, baseUrl: string) {
        this.httpClient = new IIDHttpClient(apiKey, baseUrl);
    }

    getPushKeyDetails(pushKey: string) {
        return new Promise<object>((resolve, reject) => {
            this.httpClient.getRequest("iid/info/"+pushKey, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (typeof response.body !== "object") {
                    if (response.statusCode === 404) {
                        reject(new Error("Invalid push key!"));
                    } else {
                        reject(new Error("Couldn't parse JSON response"));
                    }
                    return;
                }
                FCMApiClient.checkForFCMErrors(response)
                    .then(() => {
                        resolve(response.body);
                    }).catch((error) => reject(error));
            });
        });
    }

}
