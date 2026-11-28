import { Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { HeroStage } from './components/HeroStage';
import {
  BackgroundKineticMarquee,
  KineticTickerBand,
  PointerSpotlight,
} from './components/SpatialFX';
import { LivePulseSection } from './components/LivePulseSection';
import { AboutSection } from './components/AboutSection';
import { ProductsSection } from './components/ProductsSection';
import { AchievementsSection } from './components/AchievementsSection';
import { ConnectSection } from './components/ConnectSection';
import { FooterMast } from './components/FooterMast';
import { EyjaCompanion } from './components/EyjaCompanion';

const SpatialWebGLCanvas = lazy(() =>
  import('./components/SpatialWebGLCanvas').then((m) => ({ default: m.SpatialWebGLCanvas }))
);

export function App() {
  return (
    <div className="spatial-shell">
      <Suspense fallback={<div className="spatial-canvas spatial-canvas--fallback" aria-hidden="true" />}>
        <SpatialWebGLCanvas />
      </Suspense>
      <BackgroundKineticMarquee />
      <PointerSpotlight />
      <Navbar />
      <main id="main" className="spatial-main">
        <HeroStage />
        <KineticTickerBand />
        <LivePulseSection />
        <ProductsSection />
        <AboutSection />
        <AchievementsSection />
        <ConnectSection />
      </main>
      <FooterMast />
      <EyjaCompanion />
    </div>
  );
}

export default App;
