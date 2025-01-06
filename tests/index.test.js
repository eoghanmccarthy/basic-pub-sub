import { expect, describe, it, beforeEach } from "bun:test";
import { PubSub } from "../index";

describe("PubSub", () => {
    let pubsub;

    beforeEach(() => {
        pubsub = new PubSub();
    });

    it("should allow subscribing to topics", () => {
        const unsubscribe = pubsub.subscribe("test-topic", () => {});
        expect(pubsub.getSubscriberCount("test-topic")).toBe(1);
        expect(typeof unsubscribe).toBe("function");
    });

    it("should allow multiple subscribers to the same topic", () => {
        pubsub.subscribe("test-topic", () => {});
        pubsub.subscribe("test-topic", () => {});
        expect(pubsub.getSubscriberCount("test-topic")).toBe(2);
    });

    it("should call all subscribers when publishing", () => {
        let count1 = 0;
        let count2 = 0;
        const data = { test: true };

        pubsub.subscribe("test-topic", (receivedData) => {
            count1++;
            expect(receivedData).toEqual(data);
        });

        pubsub.subscribe("test-topic", (receivedData) => {
            count2++;
            expect(receivedData).toEqual(data);
        });

        pubsub.publish("test-topic", data);

        expect(count1).toBe(1);
        expect(count2).toBe(1);
    });

    it("should handle unsubscribing correctly", () => {
        const unsubscribe = pubsub.subscribe("test-topic", () => {});
        expect(pubsub.getSubscriberCount("test-topic")).toBe(1);

        unsubscribe();
        expect(pubsub.getSubscriberCount("test-topic")).toBe(0);
    });

    it("should handle multiple unsubscribes without errors", () => {
        const unsubscribe = pubsub.subscribe("test-topic", () => {});
        unsubscribe();
        unsubscribe(); // Should not throw
        expect(pubsub.getSubscriberCount("test-topic")).toBe(0);
    });

    it("should not affect other subscribers when unsubscribing", () => {
        let called = false;
        const unsubscribe1 = pubsub.subscribe("test-topic", () => {});
        const unsubscribe2 = pubsub.subscribe("test-topic", () => {
            called = true;
        });

        unsubscribe1();
        pubsub.publish("test-topic", {});

        expect(called).toBe(true);
        expect(pubsub.getSubscriberCount("test-topic")).toBe(1);
    });

    it("should clear all subscriptions", () => {
        pubsub.subscribe("topic1", () => {});
        pubsub.subscribe("topic2", () => {});
        pubsub.subscribe("topic2", () => {});

        pubsub.clear();

        expect(pubsub.getSubscriberCount("topic1")).toBe(0);
        expect(pubsub.getSubscriberCount("topic2")).toBe(0);
    });

    it("should handle publishing to topics with no subscribers", () => {
        expect(() => {
            pubsub.publish("non-existent-topic", {});
        }).not.toThrow();
    });

    it("should handle subscriber errors without affecting other subscribers", () => {
        let called = false;

        pubsub.subscribe("test-topic", () => {
            throw new Error("Subscriber error");
        });

        pubsub.subscribe("test-topic", () => {
            called = true;
        });

        pubsub.publish("test-topic", {});

        expect(called).toBe(true);
    });

    it("should maintain correct subscriber count after multiple operations", () => {
        const unsubscribe1 = pubsub.subscribe("topic", () => {});
        const unsubscribe2 = pubsub.subscribe("topic", () => {});

        expect(pubsub.getSubscriberCount("topic")).toBe(2);

        unsubscribe1();
        expect(pubsub.getSubscriberCount("topic")).toBe(1);

        const unsubscribe3 = pubsub.subscribe("topic", () => {});
        expect(pubsub.getSubscriberCount("topic")).toBe(2);

        unsubscribe2();
        unsubscribe3();
        expect(pubsub.getSubscriberCount("topic")).toBe(0);
    });
});
