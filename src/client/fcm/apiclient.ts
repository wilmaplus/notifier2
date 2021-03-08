/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import * as admin from 'firebase-admin';
import {messaging} from "firebase-admin/lib/messaging";
import MessagingDevicesResponse = messaging.MessagingDevicesResponse;

export class FCMApiClient {

    constructor() {
    }



    static sendPush(recipients: string[], data: any, ttl:number=86400):Promise<MessagingDevicesResponse> {
        let messaging = admin.messaging();
        return messaging.sendToDevice(recipients, {data: data}, {timeToLive: ttl})
    }

    static sendSinglePush(recipients: string, data: any, ttl:number=86400):Promise<MessagingDevicesResponse> {
        let messaging = admin.messaging();
        return messaging.sendToDevice(recipients, {data: data}, {timeToLive: ttl})
    }
}