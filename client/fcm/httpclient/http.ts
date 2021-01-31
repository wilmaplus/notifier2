/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {URL} from "url";

import {get, NeedleCallback, post} from "needle"
import {OutgoingHttpHeaders} from "http";

/**
 * HTTP Client for requests to FCM
 * Rewrite from original notifier code (written in python, using requests library)
 */
export class FCMHttpClient {

    private apiKey: string
    private _baseUrl: string

    /**
     * Constructor for FCM HTTP Client
     * @param apiKey API Key for FCM API
     * @param baseUrl Wilma server's base URL (possibly with slug id)
     */
    constructor(apiKey: string, baseUrl: string) {
        // Adding a slash at end if not present
        if (!baseUrl.endsWith("/"))
            baseUrl += "/";
        this._baseUrl = baseUrl;
        this.apiKey = apiKey;
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
     * GET request
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param callback Callback for this request
     */
    getRequest(url: string, callback:NeedleCallback) {
        get(this._baseUrl+url, {headers: {"Authorization": "key="+this.apiKey}}, callback);
    }

    /**
     * POST request
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param data Data
     * @param callback Callback for this request
     * @param followRedirectCount How many times a redirect should be allowed (default is 5 times)
     */
    postRequest(url: string, data: any, callback:NeedleCallback, followRedirectCount:number=5) {
        post(url, data, {json: true, headers: {"Authorization": "key="+this.apiKey}, follow:followRedirectCount}, callback);
    }

    set apikey(value: string) {
        this.apiKey = value;
    }

    set baseUrl(value: string) {
        this._baseUrl = value;
    }

    get apikey(): string {
        return this.apiKey;
    }

    get baseUrl(): string {
        return this._baseUrl;
    }
}