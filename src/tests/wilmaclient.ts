/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */


import {WilmaApiClient} from "../client/wilma/apiclient";
const testConfig = require('../../tests/testconfig.json');

export async function getExams() {
    let client = new WilmaApiClient(testConfig.server, testConfig.session);
    await client.getExams().then(function (exams) {
        console.log("array: "+exams.length);
        console.log(exams[0]);
    }).catch(function (error) {
        console.log(error);
        process.exit(-1);
    });
}

export async function getObservations() {
    let client = new WilmaApiClient(testConfig.server, testConfig.session);
    await client.getObservations().then(function (obs) {
        console.log("array: "+obs.length);
        console.log(obs[0]);
    }).catch(function (error) {
        console.log(error);
        process.exit(-1);
    });
}

export async function getNews() {
    let client = new WilmaApiClient(testConfig.server, testConfig.session);
    await client.getNews().then(function (news) {
        console.log("array: "+news.length);
        console.log(news[0]);
        console.log("Fetching first one's content");
        getNewsArticle((news[0] as any).Id, false);
        console.log("Fetching random, non-existent content");
        // This id should not exist ;)
        getNewsArticle(4454156145615613, true);
    }).catch(function (error) {
        console.log(error);
        process.exit(-1);
    });
}

export async function getNewsArticle(id: number, nonExistent=false) {
    let client = new WilmaApiClient(testConfig.server, testConfig.session);
    await client.getNewsArticle(id).then(function (newsArticle) {
        if (newsArticle !== undefined) {
            if (nonExistent) {
                console.log("Article found, should not be!");
                process.exit(-1);
            }
            console.log("Article found");
        } else {
            if (!nonExistent) {
                console.log("Article not found, should be!");
                process.exit(-1);
            }
            console.log("Article not found!");
        }
    }).catch(function (error) {
        console.log(error);
        process.exit(-1);
    });
}