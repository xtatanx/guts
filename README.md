# Guts
When big frameworks are not an option, Guts provides structure to your vanilla js project in a component-based way. Build your UI and communicate through events.

## Installation
To install please clone this repo and then run the npm install command:

```$ npm install```

## Scripts
Guts come packed with two scripts ```dev``` and ```build```.

### dev
```$ npm run dev``` will start karma, run and watch all the tests, this is all you need to start working on Guts.

### build
```$ npm run build``` will run Rollup to create a bundle which will make Guts immediately available for you to include inside your HTML.

## Documentation
Guts is written in es6 and is intended to create simple UI's with some structure. Communication between components is made through events, emit an event that triggers on your component and all the way up in the chain of components. on the other side, a broadcast event will send events all the way down in the chain of components.

The best place to start is through the examples folder in order to get a sense how guts work. Also, test specs are a great way to start understanding it.
