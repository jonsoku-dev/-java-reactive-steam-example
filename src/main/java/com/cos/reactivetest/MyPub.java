package com.cos.reactivetest;

import org.reactivestreams.Publisher;
import org.reactivestreams.Subscriber;

import java.util.Arrays;

public class MyPub implements Publisher<Integer> {

    Iterable<Integer> its = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

    public void subscribe(Subscriber<? super Integer> subscriber) {
        System.out.println("구독자: 신문사야 나 너희 신물 볼께");
        System.out.println("신문사: 알겠어 --- 구독 정보 만들어 줄테니 기다렷");
        MySubscription mySubscription = new MySubscription(subscriber, its);
        System.out.println("신문사: 구독정보 생성 완료했어 잘받아 !!");
        subscriber.onSubscribe(mySubscription);
    }
}
