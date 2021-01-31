/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {WilmaHttpClient} from "./httpclient/http";
import {NeedleResponse} from "needle";
import {WilmaError} from "./types/wilma_error";
import {Homepage} from "./types/homepage";

export class ApiError extends Error {
    wilmaError: boolean|WilmaError


    constructor(message: string, wilmaError: boolean | WilmaError=false) {
        super(message);
        this.wilmaError = wilmaError;
    }
}

export class WilmaApiClient {
    httpClient: WilmaHttpClient

    constructor(wilmaUrl: string, wilmaSession: string) {
        this.httpClient = new WilmaHttpClient(wilmaSession, wilmaUrl);
    }

    /**
     * Checks if request has an error
     * @param response Needle response
     * @private
     */
    private static checkForWilmaErrors(response: NeedleResponse): Promise<boolean|WilmaError> {
        return new Promise<boolean|WilmaError>((resolve) => {
            if (response.statusCode != 200) {
                if (response.body.error) {
                    // Resolving as error
                    resolve((<WilmaError> response.body.error));
                    return;
                }
            }
            // No errors found
            resolve(false);
        });
    }

    /**
     * Checks if current Wilma session is valid
     */
    checkSession() {
        return new Promise<boolean>((resolve, reject) => {
            this.httpClient.authenticatedGetRequest("index_json", (error, response) => {
                if (error) {
                    reject(error);
                    return
                }
                // Checking for errors
                WilmaApiClient.checkForWilmaErrors(response)
                    .then((error) => {
                        if (!error) {
                            let homepage = (<Homepage> response.body);
                            if (typeof homepage !== 'object') {
                                reject(new ApiError("Unable to obtain JSON response"));
                                return;
                            }
                            // Checking if PrimusId and Type is present. If not, that probably means that session's
                            // account is a "new" account type, which would require including role's slug ID to base URL.
                            if (homepage.PrimusId && homepage.Type) {
                                resolve(true);
                            } else {
                                reject(new ApiError("Unable to get user information. Are you sure that you included Slug ID?"));
                            }
                        } else {
                            reject(new ApiError((<WilmaError> error).message, error));
                        }
                    }).catch(err => reject(err));
            })
        });
    }

    getExams() {
        return new Promise<object[]>((resolve, reject) => {
            this.checkSession().then(() => {
                this.httpClient.authenticatedGetRequest("exams/index_json", (error, response) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    WilmaApiClient.checkForWilmaErrors(response)
                        .then(error => {
                            if (error) {
                                reject(new ApiError((<WilmaError> error).message, error));
                            } else {
                                resolve(response.body.Exams || []);
                            }
                        });
                });
            }).catch(reason => reject(reason));
        })
    }

    getObservations() {
        return new Promise<object[]>((resolve, reject) => {
            this.checkSession().then(() => {
                this.httpClient.authenticatedGetRequest("attendance/index_json", (error, response) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    WilmaApiClient.checkForWilmaErrors(response)
                        .then(error => {
                            if (error) {
                                reject(new ApiError((<WilmaError> error).message, error));
                            } else {
                                resolve(response.body.Observations || []);
                            }
                        });
                });
            }).catch(reason => reject(reason));
        })
    }

    getNews() {
        return new Promise<object[]>((resolve, reject) => {
            this.checkSession().then(() => {
                this.httpClient.authenticatedGetRequest("news/index_json", (error, response) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    WilmaApiClient.checkForWilmaErrors(response)
                        .then(error => {
                            if (error) {
                                reject(new ApiError((<WilmaError> error).message, error));
                            } else {
                                resolve(response.body.News || []);
                            }
                        });
                });
            }).catch(reason => reject(reason));
        })
    }

    getNewsArticle(id: number) {
        return new Promise<object[]>((resolve, reject) => {
            this.checkSession().then(() => {
                this.httpClient.authenticatedGetRequest("news/index_json/"+id, (error, response) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    WilmaApiClient.checkForWilmaErrors(response)
                        .then(error => {
                            if (error) {
                                reject(new ApiError((<WilmaError> error).message, error));
                            } else {
                                resolve(response.body.News[0] || undefined);
                            }
                        });
                });
            }).catch(reason => reject(reason));
        })
    }

}

