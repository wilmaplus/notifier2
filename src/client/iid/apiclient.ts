/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {FCMApiClient} from "../fcm/apiclient";
import {IIDHttpClient} from "./httpclient/http";
import {NeedleResponse} from "needle";
import {FCMError} from "../fcm/types/error";

export class IIDApiClient {
    httpClient: IIDHttpClient

    constructor(apiKey: string, baseUrl: string) {
        this.httpClient = new IIDHttpClient(apiKey, baseUrl);
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
                IIDApiClient.checkForFCMErrors(response)
                    .then(() => {
                        resolve(response.body);
                    }).catch((error) => reject(error));
            });
        });
    }

}
