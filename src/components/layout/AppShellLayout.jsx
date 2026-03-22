import { AppProvider } from '../../context/AppContext'
import Shell from './Shell'

/**
 * Authenticated app: global app context + persistent shell (PRD §6).
 */
export default function AppShellLayout() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
