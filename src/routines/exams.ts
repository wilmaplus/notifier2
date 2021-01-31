/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "./abstract";

export class ExamsRoutine extends AbstractRoutine {

    constructor(encryptionKey: string) {
        super(encryptionKey, "exams");
    }

    check(wilmaServer: string, wilmaSession: string, pushIds: string[], userId: string) {
        // TODO
    }
}
