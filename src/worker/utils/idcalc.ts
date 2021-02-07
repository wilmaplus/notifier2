/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {WilmaHttpClient} from "../../client/wilma/httpclient/http";
import {Storage} from "../../storage/storage";

export function getWorkerId(userId: number, userType: number, wilmaServer: string): Promise<string> {
    return new Promise<string>(resolve => {
        resolve(Storage.hash(userId+"."+userType+"."+WilmaHttpClient.getDomainFromURL(wilmaServer)));
    });
}
