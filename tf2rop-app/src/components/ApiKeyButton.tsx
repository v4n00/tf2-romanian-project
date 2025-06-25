import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApiKey } from '@/contexts/ApiKeyContext';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const ApiKeyButton = () => {
	const { apiKey, setApiKey } = useApiKey();
	const [inputValue, setInputValue] = useState(apiKey);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setApiKey(e.target.value);
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">API Key</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eleven Labs API Key</DialogTitle>
					<DialogDescription>Enter your Eleven Labs API key to use the service. Automatically saved.</DialogDescription>
					<Input placeholder="Enter your API key" value={inputValue} onChange={handleChange} />
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};
