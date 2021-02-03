/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

export class ExamSaveFile {
    exams: Exam[]


    constructor(exams: Exam[]) {
        this.exams = exams;
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


    constructor(type: string, data: string, payload: any) {
        this.type = type;
        this.data = data;
        this.payload = payload;
    }
}