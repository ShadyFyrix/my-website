import { Navbar } from './components/Navbar';
import { HeroStage } from './components/HeroStage';
import { LivePulseSection } from './components/LivePulseSection';
import { AboutSection } from './components/AboutSection';
import { ProductsSection } from './components/ProductsSection';
import { AchievementsSection } from './components/AchievementsSection';
import { ConnectSection } from './components/ConnectSection';
import { FooterMast } from './components/FooterMast';
import { useLiveData } from './hooks/useLiveData';

export function App() {
  const { data, isSyncing, nextSyncIn, mode, refreshNow } = useLiveData();

  return (
    <div className="page-shell">
      <Navbar />
      <main id="main">
        <HeroStage />
        <LivePulseSection
          data={data}
          isSyncing={isSyncing}
          nextSyncIn={nextSyncIn}
          mode={mode}
          onRefresh={() => void refreshNow()}
        />
        <AboutSection />
        <ProductsSection />
        <AchievementsSection />
        <ConnectSection />
      </main>
      <FooterMast />
    </div>
  );
}

export default App;
