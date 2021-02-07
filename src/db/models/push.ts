/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {DataTypes, Sequelize} from "sequelize";
import {getRoutineNames} from "../../config/routines";

export function definePushKeys(sequelize: Sequelize) {
    return sequelize.define('push_keys', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUID,
            primaryKey: true,
            unique: true
        },
        key: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.STRING
        },
        allowedRoutines: {
            type: DataTypes.JSON,
            defaultValue: getRoutineNames()
        }
    })
}

export class PushKey {
    id: string
    key: string
    userId: string
    allowedRoutines: string[]


    constructor(id: string, key: string, userId: string, allowedRoutines: string[]) {
        this.id = id;
        this.key = key;
        this.userId = userId;
        this.allowedRoutines = allowedRoutines;
    }
}