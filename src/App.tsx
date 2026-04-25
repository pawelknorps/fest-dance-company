import { AppShell } from './app/AppShell'
import { HelmetProvider } from 'react-helmet-async'

function App({ helmetContext }: { helmetContext?: any }) {
  console.log('App received helmetContext:', !!helmetContext);
  return (
    <HelmetProvider context={helmetContext}>
      <AppShell />
    </HelmetProvider>
  )
}

export default App
