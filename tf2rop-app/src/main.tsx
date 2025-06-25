import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { Toaster } from 'sonner';
import { App } from './App';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<HashRouter>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<DatabaseProvider>
				<ApiKeyProvider>
					<App />
					<Toaster />
				</ApiKeyProvider>
			</DatabaseProvider>
		</ThemeProvider>
	</HashRouter>
);

// TODO:
// API request to ElevenLabs
// Generate Voiceline button
// Custom save location button
// Save button generates file and moves to custom save location if exists
