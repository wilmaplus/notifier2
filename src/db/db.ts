/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import Model, {Sequelize} from "sequelize";
import {openDBConnection} from "./controller";
import {definePushKeys} from "./models/push";
import {v4} from "uuid";
import {getRoutineNames} from "../config/routines";

export class Database {
    dbSession: Sequelize
    models: {[key: string]: Model.ModelCtor<any>}
    config: {[key: string]: any};


    constructor(dbname: string, username: string, password: string, host='localhost') {
        this.dbSession = openDBConnection(dbname, username, password, host);
        this.models = {}
        this.config = {dbname: dbname, username: username, password: password, host: host};
    }

    async connect() {
        try {
            await this.dbSession.authenticate();
            console.log('Database Connection has been established successfully.');
            this.models.pushKeys = definePushKeys(this.dbSession);
            await this.dbSession.sync();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            process.exit(-1);
        }
    }

    addPushKey(key: string, owner: string, allowedRoutines: string[]=getRoutineNames()): Promise<any> {
        return this.models.pushKeys.create({id: v4(), key: key, userId: owner, allowedRoutines: allowedRoutines})
    }

    getUserKeys(owner: string, callback: (item: any) => void) {
        this.models.pushKeys.findAll({
            where: {
                userId: owner
            }
        }).then(function (data) {
            callback((data === undefined || data.length < 1) ? [] : data);
        });
    }

    keyExists(key: string, owner: string, callback: (contains: boolean) => void) {
        this.models.pushKeys.findAll({
            where: {
                key: key,
                userId: owner
            }
        }).then(function (data) {
            callback(data === undefined ? false : data.length > 0);
        });
    }

    updateAllowedRoutines(key: string, owner: string, allowedRoutines: string[]): Promise<any> {
        return this.models.pushKeys.update({allowedRoutines: allowedRoutines}, {
            where: {
                key: key,
                userId: owner
            }
        });
    }

    removePushKey(key: string, owner: string): Promise<any> {
        return this.models.pushKeys.destroy({
            where: {
                key: key,
                userId: owner
            }
        })
    }
}