// main.jsx stays like this
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import './index.css';
import App from './app/App';

createRoot(document.getElementById('root')).render(

    <Provider store={store}>
      <App />
    </Provider>
  
);