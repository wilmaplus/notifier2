/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AbstractRoutine} from "../routines/abstract";
import {ExamsRoutine} from "../routines/exams";
import {ObservationsRoutine} from "../routines/obs";
import {NewsRoutine} from "../routines/news";

export var routines = [ExamsRoutine, ObservationsRoutine, NewsRoutine];

export function getRoutineNames() {
    return routines.map(function(key) {
        return key.publicName;
    });
}