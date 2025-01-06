// PubSub is a simple message system that lets different parts 
// of your code communicate without directly referencing each other
export class PubSub {
    // Stores all subscribers in a Map where:
    // - keys are topics (like 'user:login')
    // - values are Sets of callback functions
    constructor() {
        this.subscribers = new Map();
    }

    // Subscribe to events. Examples:
    // const unsubscribe = pubsub.subscribe('user:login', (data) => {
    //   console.log('User logged in:', data.name)
    // })
    subscribe(topic, callback) {
        // Create a new Set for this topic if it doesn't exist
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }

        // Add the callback to the Set of subscribers
        this.subscribers.get(topic).add(callback);

        // Return an unsubscribe function that will:
        // 1. Remove this callback
        // 2. Cleanup the topic if no subscribers left
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

    // Publish events. Examples:
    // pubsub.publish('user:login', { name: 'Alice' })
    publish(topic, data) {
        const callbacks = this.subscribers.get(topic);
        if (!callbacks) return;

        // Call all subscriber callbacks with the data
        // If any callback throws, catch the error so other
        // subscribers still get the event
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in subscriber:', error);
            }
        });
    }

    // Remove all subscribers from all topics
    clear() {
        this.subscribers.clear();
    }
}
