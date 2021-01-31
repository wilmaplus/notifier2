/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";

export class ObservationsRoutine extends AbstractRoutine {

    constructor(encryptionKey: string) {
        super(encryptionKey, "obs");
    }

    check(wilmaServer: string, wilmaSession: string, pushIds: string[], userId: string) {
        // TODO
    }
}