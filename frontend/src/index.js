import ReactDOM from 'react-dom/client';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CookiesProvider } from 'react-cookie';
import { StrictMode } from 'react';
import DBProvider from './components/providers/DBProvider';
import BlobStoreProvider from './components/providers/BlobStoreProvider';
{
  /* The following line can be included in your src/index.js or App.js file */
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <CookiesProvider>
      <BlobStoreProvider>
        <DBProvider>
          <App />
        </DBProvider>
      </BlobStoreProvider>
    </CookiesProvider>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
