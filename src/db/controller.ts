/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {Sequelize} from "sequelize";

export function openDBConnection(dbname: string, username: string, password: string, host:string) {
    return new Sequelize(dbname, username, password, {
        host: host,
        dialect: 'mysql',
        logging: false,
        timezone: 'Europe/Helsinki',
        dialectOptions: {
            charset: 'utf8',
            collate: 'utf8_unicode_ci'
        }
    });
}