import { AppShell } from './app/AppShell'
import { HelmetProvider } from 'react-helmet-async'
import { LazyMotion, domAnimation } from 'framer-motion'

function App({ helmetContext }: { helmetContext?: any }) {
  return (
    <HelmetProvider context={helmetContext}>
      <LazyMotion features={domAnimation}>
        <AppShell />
      </LazyMotion>
    </HelmetProvider>
  )
}

export default App
