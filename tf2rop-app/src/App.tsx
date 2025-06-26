import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { CategoryContainer } from './components/CategoryContainer';
import { Navbar } from './components/Navbar';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { useDatabase } from './contexts/DatabaseContext';
import { useVoiceSettings } from './contexts/VoiceSettingsContext';
import { Clasa } from './models';

export const App = () => {
	const location = useLocation();
	const clasa = location.pathname.split('/')[1];
	const isValidClass = Clasa.includes(clasa);
	const { directoryHandle, setDirectoryHandle } = useVoiceSettings().voiceSettings;
	const { database, setDatabase } = useDatabase();

	const handlePickFolder = async () => {
		try {
			const dirHandle = await window.showDirectoryPicker();
			setDirectoryHandle(dirHandle);
		} catch (error) {
			console.error('Error picking folder:', error);
		}
	};

	useEffect(() => {
		const loadDatabase = async () => {
			if (!directoryHandle) {
				return;
			}
			try {
				const fileHandle = await directoryHandle.getFileHandle('database.json');
				const file = await fileHandle.getFile();
				const text = await file.text();
				const json = JSON.parse(text);
				setDatabase(json);
			} catch (e) {
				console.error(e);
			}
		};
		loadDatabase();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [directoryHandle]);

	return (
		<ResizablePanelGroup direction="horizontal" className="h-full w-full">
			<ResizablePanel className="flex flex-col items-center gap-2 px-2 py-2" defaultSize={70} minSize={70} maxSize={85}>
				{!isValidClass ? (
					<p>Select class</p>
				) : !directoryHandle ? (
					<>
						<p>No working directory selected</p>
						<Button variant="outline" onClick={handlePickFolder}>
							Select working directory
						</Button>
					</>
				) : !database ? (
					<>
						<p>No database</p>
					</>
				) : (
					<ScrollArea className="w-full h-full flex flex-col">
						{Object.entries(database[clasa]).map(([subcategoryName, subcategory]) => (
							<CategoryContainer key={subcategoryName} clasa={clasa} categoryName={subcategoryName} subcategory={subcategory} />
						))}
					</ScrollArea>
				)}
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel>
				<Navbar directoryHandle={directoryHandle} />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
