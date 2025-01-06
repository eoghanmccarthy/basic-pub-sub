export class PubSub {
    constructor() {
        this.subscribers = new Map();
    }

    // Subscribe to a topic
    subscribe(topic, callback) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }

        this.subscribers.get(topic).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(topic);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(topic);
                }
            }
        };
    }

    // Publish a message to a topic
    publish(topic, data) {
        const callbacks = this.subscribers.get(topic);
        if (!callbacks) return;

        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in subscriber:', error);
            }
        });
    }

    // Clear all subscriptions
    clear() {
        this.subscribers.clear();
    }

    // Get number of subscribers for a topic
    getSubscriberCount(topic) {
        const callbacks = this.subscribers.get(topic);
        return callbacks ? callbacks.size : 0;
    }
}
