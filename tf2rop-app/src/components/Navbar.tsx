import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApiKey } from '@/contexts/ApiKeyContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Clasa } from '@/models';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import writingFireGif from '../assets/fire-writing.gif';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ModeToggle } from './ui/mode-toggle';
import { VoiceSettings } from './VoiceSettings';

export const Navbar = () => {
	const location = useLocation();
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
	}, [location.pathname, voiceSettings]);

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

	return (
		<div className="flex flex-col gap-2 px-2 py-2 h-full">
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
			<Input type="password" placeholder="ElevenLabs API Key" value={inputValue} onChange={handleChange} />
			<Input placeholder="VoiceID" value={voiceSettings?.voiceId} onChange={handleVoiceIdChange} />
			<Button className="" onClick={() => fetchRemainingCredits()} disabled={!apiKey}>
				Remaining Credits: {remainingCredits}
			</Button>
			<ModeToggle />
			<VoiceSettings />
			<img src={writingFireGif} alt="Writing Fire" className="" />
		</div>
	);
};
