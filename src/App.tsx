/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import ViewPage from './pages/ViewPage';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doc/:id" element={<EditorPage />} />
          <Route path="/view/:id" element={<ViewPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
