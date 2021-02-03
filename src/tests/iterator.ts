/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AsyncIterator} from "../asynciterator/iterator";
import {Exam} from "../routines/misc/types";

export async function testIterator() {
    let items = [new Exam(0, "test1"), new Exam(1, "test2")];
    new AsyncIterator((item, iterator) => {
        console.log(item);
        setTimeout(() => {
            console.log("next");
            iterator.nextItem();
        }, 4000);
    }, items, () => {
        console.log("Iterator reached its end");
    }).start();
}
