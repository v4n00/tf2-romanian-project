import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApiKey } from '@/contexts/ApiKeyContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Clasa } from '@/models';
import axios from 'axios';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ModeToggle } from './ui/mode-toggle';
import { ScrollArea } from './ui/scroll-area';
import { VoiceSettings } from './VoiceSettings';

export const Navbar = () => {
	const location = useLocation();
	const { apiKey, setApiKey } = useApiKey();
	const [inputValue, setInputValue] = useState(apiKey);
	const [remainingCredits, setRemainingCredits] = useState('?');
	const { voiceSettings } = useVoiceSettings();

	// Console capture state
	const [consoleLogs, setConsoleLogs] = useState<
		Array<{
			type: 'log' | 'error' | 'warn' | 'info';
			message: string;
			timestamp: Date;
			id: number;
		}>
	>([]);
	const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
	const logIdRef = useRef(0);
	const consoleEndRef = useRef<HTMLDivElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setApiKey(e.target.value);
	};

	useEffect(() => {
		voiceSettings?.setVoiceId(localStorage.getItem(location.pathname.split('/')[1] + '_voiceId') || '');
	}, [location.pathname, voiceSettings]);

	// Console capture effect
	useEffect(() => {
		const originalLog = console.log;
		const originalError = console.error;
		const originalWarn = console.warn;
		const originalInfo = console.info;

		const addLog = (type: 'log' | 'error' | 'warn' | 'info', args: unknown[]) => {
			const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');

			setConsoleLogs((prev) =>
				[
					...prev,
					{
						type,
						message,
						timestamp: new Date(),
						id: logIdRef.current++,
					},
				].slice(-100)
			); // Keep only last 100 logs
		};

		console.log = (...args) => {
			originalLog(...args);
			addLog('log', args);
		};

		console.error = (...args) => {
			originalError(...args);
			addLog('error', args);
		};

		console.warn = (...args) => {
			originalWarn(...args);
			addLog('warn', args);
		};

		console.info = (...args) => {
			originalInfo(...args);
			addLog('info', args);
		};

		// Restore original console methods on cleanup
		return () => {
			console.log = originalLog;
			console.error = originalError;
			console.warn = originalWarn;
			console.info = originalInfo;
		};
	}, []);

	// Auto-scroll to bottom when new logs are added
	useEffect(() => {
		if (isConsoleExpanded && consoleEndRef.current) {
			consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [consoleLogs, isConsoleExpanded]);

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

	const clearConsole = () => {
		setConsoleLogs([]);
	};

	const getLogColor = (type: 'log' | 'error' | 'warn' | 'info') => {
		switch (type) {
			case 'error':
				return 'text-red-500';
			case 'warn':
				return 'text-yellow-500';
			case 'info':
				return 'text-blue-500';
			default:
				return 'text-foreground';
		}
	};

	const formatTimestamp = (timestamp: Date) => {
		return timestamp.toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
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

			{/* Console Viewer */}
			<Card className="w-full p-0">
				<div className="p-2">
					<div className="flex items-center justify-between mb-2">
						<Button type="button" variant="outline" size="sm" onClick={() => setIsConsoleExpanded(!isConsoleExpanded)} className="flex items-center gap-2">
							{isConsoleExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
							Console ({consoleLogs.length})
						</Button>
						<Button type="button" variant="outline" size="sm" onClick={clearConsole} className="flex items-center gap-2">
							<Trash2 size={14} />
							Clear
						</Button>
					</div>

					{isConsoleExpanded && (
						<ScrollArea className="h-90 w-full border rounded p-2 bg-muted/50">
							<div className="space-y-1 font-mono text-xs">
								{consoleLogs.length === 0 ? (
									<p className="text-muted-foreground italic">No console messages</p>
								) : (
									consoleLogs.map((log) => (
										<div key={log.id} className="flex gap-2 items-start">
											<span className="text-muted-foreground whitespace-nowrap">{formatTimestamp(log.timestamp)}</span>
											<span className={`uppercase font-semibold text-xs ${getLogColor(log.type)}`}>{log.type}</span>
											<span className="break-all flex-1">{log.message}</span>
										</div>
									))
								)}
								<div ref={consoleEndRef} />
							</div>
						</ScrollArea>
					)}
				</div>
			</Card>
		</div>
	);
};
