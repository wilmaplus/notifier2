/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {DataTypes, Sequelize} from "sequelize";

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
        }
    })
}