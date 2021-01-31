/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {FCMHttpClient} from "./httpclient/http";
import {NeedleResponse} from "needle";
import {FCMError} from "./types/error";

export class FCMApiClient {

    httpClient: FCMHttpClient

    constructor(apiKey: string, baseUrl: string) {
        this.httpClient = new FCMHttpClient(apiKey, baseUrl);
    }

    /**
     * Checks if request has an error
     * @param response Needle response
     * @private
     */
    public static checkForFCMErrors(response: NeedleResponse): Promise<boolean|Error> {
        return new Promise<boolean|Error>((resolve, reject) => {
            if (response.statusCode != 200) {
                if (response.body.error) {
                    // Resolving as error
                    resolve(new Error((<FCMError> response.body.error).message || "Unknown"));
                    return;
                } else {
                    reject(new Error("Unable to parse error code: "+response.statusCode));
                    return;
                }
            }
            // No errors found
            resolve(false);
        });
    }

    sendPush(recipient: string, data: any, ttl:string="86400") {
        return new Promise((resolve, reject) => {
            this.httpClient.postRequest("fcm/send", {
                "to": recipient, "ttl": ttl, "data": data
            }, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                FCMApiClient.checkForFCMErrors(response)
                    .then(() => {
                        resolve(true);
                    }).catch((error) => reject(error));
            });
        });
    }
}