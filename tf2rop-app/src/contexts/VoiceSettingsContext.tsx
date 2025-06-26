import React, { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router';

interface VoiceSettingsType {
	stability: number;
	setStability: (value: number) => void;
	useSpeakerBoost: boolean;
	setUseSpeakerBoost: (value: boolean) => void;
	similarity: number;
	setSimilarity: (value: number) => void;
	style: number;
	setStyle: (value: number) => void;
	speed: number;
	setSpeed: (value: number) => void;
	voiceId: string;
	setVoiceId: (value: string) => void;
	directoryHandle: FileSystemDirectoryHandle | null;
	setDirectoryHandle: (value: FileSystemDirectoryHandle | null) => void;
}

export const VoiceSettingsContext = createContext<{
	voiceSettings: VoiceSettingsType | null;
}>({
	voiceSettings: null,
});

export const VoiceSettingsProvider = ({ children }: { children: React.ReactNode }) => {
	const location = useLocation();

	const [stability, setStability] = useState<number>(0.5);
	const [useSpeakerBoost, setUseSpeakerBoost] = useState<boolean>(false);
	const [similarity, setSimilarity] = useState<number>(0.75);
	const [style, setStyle] = useState<number>(0);
	const [speed, setSpeed] = useState<number>(1);
	const [voiceId, setVoiceIdState] = useState<string>(() => localStorage.getItem(location.pathname.split('/')[1] + '_voiceId') || '');
	const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

	const setVoiceId = (value: string) => {
		setVoiceIdState(value);
		localStorage.setItem(location.pathname.split('/')[1] + '_voiceId', value);
	};

	const voiceSettings: VoiceSettingsType = {
		stability,
		setStability,
		useSpeakerBoost,
		setUseSpeakerBoost,
		similarity,
		setSimilarity,
		style,
		setStyle,
		speed,
		setSpeed,
		voiceId,
		setVoiceId,
		directoryHandle,
		setDirectoryHandle,
	};

	return <VoiceSettingsContext.Provider value={{ voiceSettings }}>{children}</VoiceSettingsContext.Provider>;
};

export const useVoiceSettings = () => useContext(VoiceSettingsContext);
