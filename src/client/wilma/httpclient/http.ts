/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {URL} from "url";

// @ts-ignore
import {NeedleCallback} from "needle"
const needle = require('needle-retry');
import {OutgoingHttpHeaders} from "http";

/**
 * HTTP Client for requests to Wilma
 * Rewrite from original notifier code (written in python, using requests library)
 */
export class WilmaHttpClient {

    private _session: string
    private _baseUrl: string
    private static userAgent: string = "WilmaPlusNotifier/2.0.0";

    /**
     * Constructor for Wilma HTTP Client
     * @param session Wilma2SID Session cookie value
     * @param baseUrl Wilma server's base URL (possibly with slug id)
     */
    constructor(session: string, baseUrl: string) {
        // Adding a slash at end if not present
        if (!baseUrl.endsWith("/"))
            baseUrl += "/";
        this._baseUrl = baseUrl;
        this._session = session;
    }


    /**
     * Extracts domain name from URL
     * @param url
     * @private Domain name
     */
    public static getDomainFromURL(url: string):string {
        let parsedUrl = new URL(url);
        return parsedUrl.hostname;
    }

    /**
     * Basic GET request
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param callback Callback for this request
     */
    getRequest(url: string, callback:NeedleCallback) {
        needle.get(this._baseUrl+url, {needle: {headers: {'user-agent': WilmaHttpClient.userAgent}}}, callback);
    }

    /**
     * Authenticated GET request using session cookie value
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param callback Callback for this request
     */
    authenticatedGetRequest(url: string, callback:NeedleCallback) {
        needle.get(this._baseUrl+url, {needle: {cookies: {"Wilma2SID": this._session}, headers: {'user-agent': WilmaHttpClient.userAgent}}}, callback);
    }

    /**
     * Regular POST request
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param data Data
     * @param callback Callback for this request
     * @param headers Headers
     * @param followRedirectCount How many times a redirect should be allowed (default is 5 times)
     */
    postRequest(url: string, data: any, callback:NeedleCallback, headers:OutgoingHttpHeaders, followRedirectCount:number=5) {
        needle.post(url, data, {needle: {headers:{...headers, ...{'user-agent': WilmaHttpClient.userAgent}}, follow:followRedirectCount}}, callback);
    }

    /**
     * Authenticated POST request
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param data Data
     * @param callback Callback for this request
     * @param headers Headers
     * @param followRedirectCount How many times a redirect should be allowed (default is 5 times)
     */
    authenticatedPostRequest(url: string, data: any, callback:NeedleCallback, headers:OutgoingHttpHeaders, followRedirectCount:number=5) {
        needle.post(url, data, {needle: {headers:{...headers, ...{'user-agent': WilmaHttpClient.userAgent}}, follow:followRedirectCount, cookies: {"Wilma2SID": this._session}}}, callback);
    }

    set session(value: string) {
        this._session = value;
    }

    set baseUrl(value: string) {
        this._baseUrl = value;
    }

    get session(): string {
        return this._session;
    }

    get baseUrl(): string {
        return this._baseUrl;
    }
}