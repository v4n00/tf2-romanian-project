import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { CategoryContainer } from './components/CategoryContainer';
import { Navbar } from './components/Navbar';
import { Button } from './components/ui/button';
import { useDatabase } from './contexts/DatabaseContext';
import { Clasa } from './models';

export const App = () => {
	const location = useLocation();
	const clasa = location.pathname.split('/')[1];
	const isValidClass = Clasa.includes(clasa);
	const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
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
		<div className="flex flex-col gap-2">
			<Navbar directoryHandle={directoryHandle} />
			<div className="flex flex-col items-center gap-2 px-2">
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
					<>
						{Object.entries(database[clasa]).map(([subcategoryName, subcategory]) => (
							<CategoryContainer key={subcategoryName} clasa={clasa} categoryName={subcategoryName} subcategory={subcategory} />
						))}
					</>
				)}
			</div>
		</div>
	);
};
