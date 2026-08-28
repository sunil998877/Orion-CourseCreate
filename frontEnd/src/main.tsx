import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupAuthInterceptor } from './utils/authInterceptor';
import { ThemeProvider } from './contextAPI/ThemeContext';
setupAuthInterceptor();
createRoot(document.getElementById('root')!).render(<ThemeProvider>
    <App />
  </ThemeProvider>);
