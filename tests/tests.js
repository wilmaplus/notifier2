/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

console.log("Running tests");

const wilmaClient = require('./wilmaclient');

let testSubjects = [
    {name: 'wilmaclient', functionName: 'exams', func: wilmaClient.getExams},
    {name: 'wilmaclient', functionName: 'obs', func: wilmaClient.getObservations},
    {name: 'wilmaclient', functionName: 'news', func: wilmaClient.getNews},
];

async function test() {
    for (const item of testSubjects) {
        console.log("running test: "+item.name+"->"+item.functionName);
        await item.func();
    }
}

test();