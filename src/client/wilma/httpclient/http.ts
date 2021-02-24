/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {URL} from "url";

// @ts-ignore
import needle, {NeedleCallback, get, post} from "needle"
import {OutgoingHttpHeaders} from "http";
import * as retry from "retry"
import {AppConfig} from "../../../config/app";

/**
 * HTTP Client for requests to Wilma
 * Rewrite from original notifier code (written in python, using requests library)
 */
export class WilmaHttpClient {

    private _session: string
    private _baseUrl: string
    private static retryCount: number = 5;

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
        needle.defaults({
            user_agent: "WilmaPlusNotifier/"+AppConfig.version
        })
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
        let operation = retry.operation({
            retries: WilmaHttpClient.retryCount
        });
        operation.attempt(() => {
            get(this._baseUrl+url, (error, request, body) => {
                if (operation.retry(error!=null ? error : undefined)) {
                    return;
                }
                callback(error ? operation.mainError() : null, request, body);
            });
        });
    }

    /**
     * Authenticated GET request using session cookie value
     * @param url URL path after baseURL, ie. baseUrl+"index_json" -> https://server.com/index_json
     * @param callback Callback for this request
     */
    authenticatedGetRequest(url: string, callback:NeedleCallback) {
        let operation = retry.operation({
            retries: WilmaHttpClient.retryCount
        });
        operation.attempt(() => {
            get(this._baseUrl+url,{cookies: {"Wilma2SID": this._session}}, (error, request, body) => {
                if (operation.retry(error!=null ? error : undefined)) {
                    return;
                }
                callback(error ? operation.mainError() : null, request, body);
            });
        });
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
        let operation = retry.operation({
            retries: WilmaHttpClient.retryCount
        });
        operation.attempt(() => {
            post(url, data, {headers:headers, follow:followRedirectCount}, (error, request, body) => {
                if (operation.retry(error!=null ? error : undefined)) {
                    return;
                }
                callback(error ? operation.mainError() : null, request, body);
            });
        });
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
        let operation = retry.operation({
            retries: WilmaHttpClient.retryCount
        });
        operation.attempt(() => {
            post(url, data, {headers:headers, follow:followRedirectCount, cookies: {"Wilma2SID": this._session}}, (error, request, body) => {
                if (operation.retry(error!=null ? error : undefined)) {
                    return;
                }
                callback(error ? operation.mainError() : null, request, body);
            });
        });
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