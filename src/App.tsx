import { Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { HeroStage } from './components/HeroStage';
import { KineticTickerBand, PointerSpotlight } from './components/SpatialFX';
import { LivePulseSection } from './components/LivePulseSection';
import { AboutSection } from './components/AboutSection';
import { ProductsSection } from './components/ProductsSection';
import { AchievementsSection } from './components/AchievementsSection';
import { ConnectSection } from './components/ConnectSection';
import { FooterMast } from './components/FooterMast';
import { EyjaCompanion } from './components/EyjaCompanion';
import { useLiveData } from './hooks/useLiveData';

const SpatialWebGLCanvas = lazy(() =>
  import('./components/SpatialWebGLCanvas').then((m) => ({ default: m.SpatialWebGLCanvas }))
);

export function App() {
  const { data, isSyncing, nextSyncIn, mode, refreshNow } = useLiveData();

  return (
    <div className="spatial-shell">
      <Suspense fallback={<div className="spatial-canvas spatial-canvas--fallback" aria-hidden="true" />}>
        <SpatialWebGLCanvas />
      </Suspense>
      <PointerSpotlight />
      <Navbar />
      <main id="main" className="spatial-main">
        <HeroStage />
        <KineticTickerBand />
        <LivePulseSection
          data={data}
          isSyncing={isSyncing}
          nextSyncIn={nextSyncIn}
          mode={mode}
          onRefresh={() => void refreshNow()}
        />
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
