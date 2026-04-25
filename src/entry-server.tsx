import ReactDOMServer from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

export function render() {
  const helmetContext: any = {};
  
  // Render to string
  const html = ReactDOMServer.renderToString(
    <App helmetContext={helmetContext} />
  );
  
  console.log('--- SSR HTML DEBUG ---');
  console.log('HTML snippet:', html.substring(0, 500));
  console.log('------------------------');

  const helmet = helmetContext.helmet;
  
  console.log('--- SSR HELMET DEBUG ---');
  console.log('Context content:', JSON.stringify(Object.keys(helmetContext)));
  console.log('Helmet object:', !!helmet);
  console.log('------------------------');
  
  return { html, helmet };
}

