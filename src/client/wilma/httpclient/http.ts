/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {URL} from "url";

import {get, NeedleCallback, post} from "needle"
import {OutgoingHttpHeaders} from "http";

/**
 * HTTP Client for requests to Wilma
 * Rewrite from original notifier code (written in python, using requests library)
 */
export class WilmaHttpClient {

    private _session: string
    private _baseUrl: string

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
     * !! NOTE !! Added for future use, currently seems to have no use
     * Extracts domain name from URL
     * @param url
     * @private Domain name
     */
    private static getDomainFromURL(url: string):string {
        let parsedUrl = new URL(url);
        return parsedUrl.hostname;
    }

    /**
     * Basic GET request
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param callback Callback for this request
     */
    getRequest(url: string, callback:NeedleCallback) {
        get(this._baseUrl+url,callback);
    }

    /**
     * Authenticated GET request using session cookie value
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param callback Callback for this request
     */
    authenticatedGetRequest(url: string, callback:NeedleCallback) {
        get(this._baseUrl+url, {cookies: {"Wilma2SID": this._session}}, callback);
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
        post(url, data, {headers:headers, follow:followRedirectCount}, callback);
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
        post(url, data, {headers:headers, follow:followRedirectCount, cookies: {"Wilma2SID": this._session}}, callback);
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