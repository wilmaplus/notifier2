/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

export class SessionCheck {
    valid: boolean
    userId: number
    userType: number


    constructor(valid: boolean, userId: number, userType: number) {
        this.valid = valid;
        this.userId = userId;
        this.userType = userType;
    }
}
