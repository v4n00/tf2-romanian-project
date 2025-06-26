import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { Toaster } from 'sonner';
import { App } from './App';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { VoiceSettingsProvider } from './contexts/VoiceSettingsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<HashRouter>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<DatabaseProvider>
				<VoiceSettingsProvider>
					<ApiKeyProvider>
						<App />
						<Toaster />
					</ApiKeyProvider>
				</VoiceSettingsProvider>
			</DatabaseProvider>
		</ThemeProvider>
	</HashRouter>
);
