/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */



import {getExams, getNews, getObservations} from "./wilmaclient";
import {testCipher} from "./aes";

let testSubjects = [
    {name: 'wilmaclient', functionName: 'exams', func: getExams},
    {name: 'wilmaclient', functionName: 'obs', func: getObservations},
    {name: 'wilmaclient', functionName: 'news', func: getNews},
    {name: 'aes', functionName: 'testCipher', func: testCipher},
];

async function test() {
    console.log("Running tests");
    for (const item of testSubjects) {
        console.log("running tests: "+item.name+"->"+item.functionName);
        await item.func();
    }
}

test();