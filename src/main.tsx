import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { LanguageProvider } from './i18n/LanguageContext';
import { SpatialProvider } from './components/SpatialContext';
import './styles/spatial.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <SpatialProvider>
          <App />
        </SpatialProvider>
      </LanguageProvider>
    </MotionConfig>
  </StrictMode>
);
