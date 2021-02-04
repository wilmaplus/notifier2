/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {HashUtils} from "../../crypto/hash";
import {WilmaHttpClient} from "../../client/wilma/httpclient/http";

export function getWorkerId(userId: number, userType: number, wilmaServer: string): Promise<string> {
    return new Promise<string>(resolve => {
        resolve(HashUtils.sha256Digest(userId+"."+userType+"."+WilmaHttpClient.getDomainFromURL(wilmaServer)));
    });
}
