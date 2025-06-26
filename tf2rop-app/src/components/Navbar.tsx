import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApiKey } from '@/contexts/ApiKeyContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Clasa } from '@/models';
import axios from 'axios';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ModeToggle } from './ui/mode-toggle';
import { VoiceSettings } from './VoiceSettings';

export const Navbar = ({ directoryHandle }: { directoryHandle: FileSystemDirectoryHandle | null }) => {
	const location = useLocation();
	const { database } = useDatabase();
	const { apiKey, setApiKey } = useApiKey();
	const [inputValue, setInputValue] = useState(apiKey);
	const [remainingCredits, setRemainingCredits] = useState('?');
	const { voiceSettings } = useVoiceSettings();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setApiKey(e.target.value);
	};

	useEffect(() => {
		voiceSettings?.setVoiceId(localStorage.getItem(location.pathname.split('/')[1] + '_voiceId') || '');
	}, [location.pathname]);

	const fetchRemainingCredits = async () => {
		try {
			const response = await axios.get('https://api.elevenlabs.io/v1/user/subscription', {
				headers: {
					'Content-Type': 'application/json',
					'xi-api-key': apiKey,
				},
			});

			if (response.status !== 200) {
				throw new Error('Failed to fetch remaining credits');
			}

			const credits = response.data.character_limit - response.data.character_count;
			setRemainingCredits(credits.toString());

			console.log(response);
		} catch (error) {
			console.error(error);
			toast.error('Failed to fetch remaining credits');
			setRemainingCredits('?');
		}
	};

	const handleVoiceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!voiceSettings) return;

		const voiceId = e.target.value;
		voiceSettings?.setVoiceId(voiceId);
	};

	const handleSaveDatabase = async () => {
		if (!directoryHandle) {
			console.error('No directory handle available');
			return;
		}

		try {
			const fileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(JSON.stringify(database));
			await writable.close();
			toast.success('Database saved successfully!');
		} catch (error) {
			console.error('Error saving database:', error);
		}
	};

	return (
		<div className="flex flex-col gap-2 px-2 py-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button>Clasă: {location.pathname.split('/')[1] || 'Selectează'}</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{Clasa.map((clasa) => (
						<DropdownMenuItem key={clasa} asChild>
							<Link to={`/${clasa}`} className="text-sm">
								{clasa}
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<Button variant="success" onClick={handleSaveDatabase} disabled={!directoryHandle}>
				<Save />
				Save database
			</Button>
			<Input type="password" placeholder="ElevenLabs API Key" value={inputValue} onChange={handleChange} />
			<Input placeholder="VoiceID" value={voiceSettings?.voiceId} onChange={handleVoiceIdChange} />
			<Button className="flex-1" onClick={() => fetchRemainingCredits()} disabled={!apiKey}>
				Remaining Credits: {remainingCredits}
			</Button>
			<ModeToggle />
			<VoiceSettings />
		</div>
	);
};
