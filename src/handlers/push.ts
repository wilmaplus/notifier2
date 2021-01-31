/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {Request, Response} from "express";
import {responseStatus} from "../utils/response_utilities";
import {Handler} from "../worker/handler";
const { Worker } = require('worker_threads');

export function push(req: Request, res: Response) {
    const worker = new Worker("./build/worker/notifier.js");
    worker.on('error', (err: any) => {
        console.log(err);
    });
    const id = ((global as any).workerHandler as Handler).startNewWorker(worker);
    console.log("thread with id "+id+" started");
    responseStatus(res)
}