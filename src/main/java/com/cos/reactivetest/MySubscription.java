package com.cos.reactivetest;

import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

import java.util.Iterator;

// 구독 정보 (구독자, 어떤 데이터를 구독할지)
public class MySubscription implements Subscription {

    private Subscriber s;
    private Iterator<Integer> it;

    public MySubscription(Subscriber subscriber, Iterable<Integer> its) {
        this.s = subscriber;
        this.it = its.iterator();
    }

    public void request(long n) { // 1
        while (n > 0) {
            if (it.hasNext()) {
                s.onNext(it.next()); // 1
            } else {
                s.onComplete();
                break;
            }
            n--;
        }
    }

    public void cancel() {

    }
}
