/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SoundProvider } from './context/SoundContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DuckRacePage } from './pages/DuckRacePage';
import { TurtleRacePage } from './pages/TurtleRacePage';
import { GiveawayPage } from './pages/GiveawayPage';

export default function App() {
  return (
    <SoundProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-brand-dark text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/duck-race" element={<DuckRacePage />} />
              <Route path="/turtle-race" element={<TurtleRacePage />} />
              <Route path="/giveaway" element={<GiveawayPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </SoundProvider>
  );
}
