# Basic PubSub

## Usage

```javascript
// Create a PubSub instance
const pubsub = new PubSub();

// First subscriber - logs user logins
const unsubscribe1 = pubsub.subscribe('user-login', (user) => {
  console.log(`User logged in: ${user.name}`);
});

// Second subscriber - handles notifications
const unsubscribe2 = pubsub.subscribe('user-login', (user) => {
  showNotification(`Welcome back ${user.name}!`);
});

// Publish an event - both subscribers will be called
pubsub.publish('user-login', { 
  name: 'Alice', 
  id: 123 
});

// Later: unsubscribe if needed
unsubscribe1();
unsubscribe2();

// Helper function for the example
function showNotification(message) {
  console.log(`NOTIFICATION: ${message}`);
}
```
