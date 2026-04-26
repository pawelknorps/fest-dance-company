import ReactDOMServer from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

export function render() {
  const helmetContext: any = {};
  
  // Render to string
  const html = ReactDOMServer.renderToString(
    <App helmetContext={helmetContext} />
  );
  

  const helmet = helmetContext.helmet;
  
  
  return { html, helmet };
}

