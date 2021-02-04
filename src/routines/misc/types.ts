/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

export class ExamSaveFile {
    exams: Exam[]


    constructor(exams: Exam[]) {
        this.exams = exams;
    }
}

export class ObservationsSaveFile {
    observations: Observation[]

    constructor(observations: Observation[]) {
        this.observations = observations;
    }
}

export class NewsSaveFile {
    news: NewsArticle[]

    constructor(news: NewsArticle[]) {
        this.news = news;
    }
}

export class ObservationsResponse {
    observations: Observation[]
    allowedExcusesSaving: boolean


    constructor(observations: Observation[], allowedExcusesSaving: boolean) {
        this.observations = observations;
        this.allowedExcusesSaving = allowedExcusesSaving;
    }
}

export class Observation {
    Id: number
    allowSaveExcuse: boolean

    constructor(Id: number) {
        this.Id = Id;
        this.allowSaveExcuse = false;
    }
}

export class NewsArticle {
    Id: number

    constructor(Id: number) {
        this.Id = Id;
    }
}

export class Exam {
    ExamId: number
    Grade: string

    constructor(ExamId: number, Grade: string) {
        this.ExamId = ExamId;
        this.Grade = Grade;
    }

}

export class Query {
    type: string
    data: string
    payload: any
    user_id: number
    user_type: number
    server: string

    constructor(type: string, data: string, payload: any, user_id: number, user_type: number, server: string) {
        this.type = type;
        this.data = data;
        this.payload = payload;
        this.user_id = user_id;
        this.user_type = user_type;
        this.server = server;
    }
}