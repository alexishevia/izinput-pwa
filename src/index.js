import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './redux/rootReducer';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { init as gdriveInit } from './redux/gdrive/actions';

import 'semantic-ui-css/semantic.min.css'

const store = configureStore({ reducer: rootReducer });

store.dispatch(gdriveInit());

ReactDOM.render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
