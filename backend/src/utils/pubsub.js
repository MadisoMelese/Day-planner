// import { EventEmitter } from "events";

// // A simple publisher/subscriber instance
// export const pubsub = new EventEmitter();


import { EventEmitter } from "events";

class PubSub extends EventEmitter {
  asyncIterator(event) {
    const ee = this;
    return {
      async next() {
        return new Promise((resolve) => {
          const handler = (payload) => {
            resolve({ value: payload, done: false });
            ee.removeListener(event, handler);
          };
          ee.on(event, handler);
        });
      },
      return() {
        return { done: true };
      },
      throw(error) {
        throw error;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  publish(event, payload) {
    this.emit(event, payload);
  }
}

export const pubsub = new PubSub();
