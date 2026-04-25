import { AppShell } from './app/AppShell'
import { HelmetProvider } from 'react-helmet-async'

function App() {
  return (
    <HelmetProvider>
      <AppShell />
    </HelmetProvider>
  )
}

export default App
