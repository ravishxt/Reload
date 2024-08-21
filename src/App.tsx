import { ThemeProvider } from "@/components/theme-provider"
import ClearCacheAndReload from '@/components/reload'
import { ModeToggle } from "@/components/mode-toggle";
import './App.css'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed top-6 right-4">
        <ModeToggle/>
      </div>
      <ClearCacheAndReload/>
    </ThemeProvider>
  )
}

export default App
