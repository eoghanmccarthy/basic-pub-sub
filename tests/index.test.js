import { expect, describe, it, beforeEach } from "bun:test";
import { PubSub } from "../index";

describe("PubSub", () => {
    let pubsub;

    beforeEach(() => {
        pubsub = new PubSub();
    });

    it("should allow subscribing to topics", () => {
        let called = false;
        const unsubscribe = pubsub.subscribe("test-topic", () => {
            called = true;
        });

        pubsub.publish("test-topic", {});
        expect(called).toBe(true);
        expect(typeof unsubscribe).toBe("function");
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
        let called = false;
        const unsubscribe = pubsub.subscribe("test-topic", () => {
            called = true;
        });

        unsubscribe();
        pubsub.publish("test-topic", {});
        expect(called).toBe(false);
    });

    it("should handle multiple unsubscribes without errors", () => {
        let called = false;
        const unsubscribe = pubsub.subscribe("test-topic", () => {
            called = true;
        });

        unsubscribe();
        unsubscribe(); // Should not throw
        pubsub.publish("test-topic", {});
        expect(called).toBe(false);
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
    });

    it("should clear all subscriptions", () => {
        let called1 = false;
        let called2 = false;

        pubsub.subscribe("topic1", () => { called1 = true; });
        pubsub.subscribe("topic2", () => { called2 = true; });

        pubsub.clear();
        pubsub.publish("topic1", {});
        pubsub.publish("topic2", {});

        expect(called1).toBe(false);
        expect(called2).toBe(false);
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
});
