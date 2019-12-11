import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { save, load } from "redux-localstorage-simple"
import { Provider } from "react-redux";
import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import mainReducer from './store/main';
import { initialState as mainInitialState } from './store/main';
import identityReducer from './store/identity';
import { initialState as identityInitialState } from './store/identity';

import reduxWebsocket from '@giantmachines/redux-websocket';

import { blackBoxMiddleware } from '@oqton/redux-black-box';

const composeEnhancers =
    typeof window === 'object' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        }) : compose;

const statesToSyncToLocalStorage = [
    "main.files",
    "identity.pk",
    "identity.ownershipproofs"
];


// Create the ws middleware instance.
const reduxWebsocketMiddleware = reduxWebsocket({ reconnectOnClose: true });


const enhancer = composeEnhancers(
    applyMiddleware(blackBoxMiddleware, reduxWebsocketMiddleware, save({ states: statesToSyncToLocalStorage })),
);

const reducer = combineReducers({ main: mainReducer, identity: identityReducer });
const localStorageState = {
    main: Object.assign(
        {},
        mainInitialState,
        load({ states: statesToSyncToLocalStorage }).main
    ),
    identity: Object.assign(
        {},
        identityInitialState,
        load({ states: statesToSyncToLocalStorage }).identity
    )
};

const store = createStore(reducer, localStorageState, enhancer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
