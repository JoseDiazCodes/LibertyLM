import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupCSP, logSecurityRecommendations } from './lib/csp'

// Initialize security policies
setupCSP();
logSecurityRecommendations();

createRoot(document.getElementById("root")!).render(<App />);
