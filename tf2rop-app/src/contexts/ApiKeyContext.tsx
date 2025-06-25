// ApiKeyContext.tsx
import React, { createContext, useContext, useState } from 'react';

type ApiKeyContextType = {
	apiKey: string;
	setApiKey: (key: string) => void;
};

const ApiKeyContext = createContext<ApiKeyContextType>({
	apiKey: '',
	setApiKey: () => {},
});

export const ApiKeyProvider = ({ children }: { children: React.ReactNode }) => {
	const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('apiKey') || '');

	const setApiKey = (key: string) => {
		setApiKeyState(key);
		localStorage.setItem('apiKey', key);
	};

	return <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>{children}</ApiKeyContext.Provider>;
};

export const useApiKey = () => useContext(ApiKeyContext);
