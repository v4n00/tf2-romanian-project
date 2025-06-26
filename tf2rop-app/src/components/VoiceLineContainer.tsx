import type { Clasa, Database, Voiceline } from '@/models';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

import { useApiKey } from '@/contexts/ApiKeyContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

const formSchema = z.object({
	id: z.number().readonly(),
	englishVoiceline: z.string().optional(),
	romanianVoiceline: z.string().optional(),
	audioEnglishVoiceline: z.string().optional(),
	audioElevenLabs: z.string().optional(),
	customSaveLocation: z.string().optional(),
	notMaking: z.boolean().optional(),
});

export const VoicelineContainer = ({ voiceline, clasa, category, subcategory }: { voiceline: Voiceline; clasa: (typeof Clasa)[number]; category: string; subcategory: string }) => {
	const { database, setDatabase } = useDatabase();
	const { apiKey } = useApiKey();
	const { voiceSettings } = useVoiceSettings();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: voiceline.id,
			englishVoiceline: voiceline.english,
			romanianVoiceline: voiceline.romanianTranslation || '',
			audioEnglishVoiceline: voiceline.audioTF2Wiki || '',
			audioElevenLabs: voiceline.audioElevenLabs || '',
			customSaveLocation: voiceline.customSaveLocation || '',
			notMaking: voiceline.notMaking || false,
		},
	});

	const notMakingState = form.watch('notMaking');

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!voiceSettings) {
			toast.error('Voice settings are not set');
			return;
		}

		const directoryHandle = voiceSettings.directoryHandle;

		if (!directoryHandle) {
			console.error('Directory handle is not set');
			toast.error('Directory handle is not set');
			return;
		}

		if (!database) {
			console.error('Database is not loaded');
			toast.error('Database is not loaded');
			return;
		}

		if (values.audioElevenLabs) {
			// save to working directory

			if (!directoryHandle || !values.audioEnglishVoiceline || !values.audioElevenLabs) {
				console.log(directoryHandle, values.audioEnglishVoiceline, values.audioElevenLabs, values.customSaveLocation);
				toast.error('Failed to save audio file: Invalid voiceline');
				return;
			}

			const fileName = `${values.audioEnglishVoiceline.split('/').pop()?.replace('.wav', '.mp3')}`;
			console.log('Saving audio file: ', fileName);

			let filePath = '';
			async function saveAudioBlobToDirectory(blob: Blob, fileName: string, directoryHandle: FileSystemDirectoryHandle, subfolderPath?: string): Promise<void> {
				try {
					let currentDir = directoryHandle;

					// Create subfolders if subfolderPath is given
					if (subfolderPath) {
						const parts = subfolderPath.split('/').filter((part) => part.trim() !== '');
						for (const part of parts) {
							currentDir = await currentDir.getDirectoryHandle(part, { create: true });
						}
					}

					// Create and write the file
					const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
					const writable = await fileHandle.createWritable();
					await writable.write(blob);
					await writable.close();

					// change audioElevenLabs to the file path
					filePath = `${currentDir.name}/${fileName}`;
				} catch (error) {
					console.error('Failed to save audio file:', error);
					throw new Error('Saving failed');
				}
			}

			// save to directory handle
			try {
				// Fetch blob from object URL
				const response = await fetch(values.audioElevenLabs);
				const audioBlob = await response.blob();
				await saveAudioBlobToDirectory(audioBlob, fileName, directoryHandle, values.customSaveLocation);

				toast.success(`Audio file saved as ${fileName}`);
			} catch (error) {
				toast.error('Error saving audio file');
				console.error(error);
			}

			form.setValue('audioElevenLabs', filePath);
			values.audioElevenLabs = filePath;
		}

		const updatedVoiceline = {
			...voiceline,
			english: values.englishVoiceline,
			romanianTranslation: values.romanianVoiceline,
			audioTF2Wiki: values.audioEnglishVoiceline,
			audioElevenLabs: values.audioElevenLabs,
			customSaveLocation: values.customSaveLocation,
			notMaking: values.notMaking,
		};

		console.log('Updating voiceline:', updatedVoiceline);

		const updatedSubcategory = database[clasa][category][subcategory].map((line) => (line.id === values.id ? updatedVoiceline : line));

		const updatedDatabase = {
			...database,
			[clasa]: {
				...database[clasa],
				[category]: {
					...database[clasa][category],
					[subcategory]: updatedSubcategory,
				},
			},
		};

		setDatabase(updatedDatabase as Database);
		const fileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
		const writable = await fileHandle.createWritable();
		await writable.write(JSON.stringify(updatedDatabase, null, 2));
		await writable.close();
	};

	const generateVoiceline = async () => {
		const romanianTranslation = form.getValues('romanianVoiceline');

		if (!apiKey) {
			toast.error('API key is not set');
			return;
		}

		if (romanianTranslation === '' || !romanianTranslation) {
			toast.error('Romanian translation is required to generate a voice line');
			return;
		}

		if (!voiceSettings) {
			return;
		}

		console.log('Generating voice line for:', romanianTranslation);

		try {
			setGenerating(true);

			const elevenlabs = new ElevenLabsClient({
				apiKey: apiKey,
			});

			const audio = await elevenlabs.textToSpeech.convert(voiceSettings.voiceId, {
				text: romanianTranslation,
				modelId: 'eleven_multilingual_v2',
				voiceSettings: {
					stability: voiceSettings?.stability,
					similarityBoost: voiceSettings?.similarity,
					style: voiceSettings?.style,
					speed: voiceSettings?.speed,
					useSpeakerBoost: voiceSettings?.useSpeakerBoost,
				},
			});

			console.log('Audio generated:', audio);

			const reader = audio.getReader();
			const chunks: Uint8Array[] = [];

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) chunks.push(value);
			}
			const audioBlob = new Blob(
				chunks.map((chunk) => new Uint8Array(chunk)),
				{ type: 'audio/mpeg' }
			);
			const audioUrl = URL.createObjectURL(audioBlob);

			form.setValue('audioElevenLabs', audioUrl);
			toast.success('Voice line generated');
		} catch (error) {
			console.error(error);
			toast.error('Failed to generate voice line');
			return;
		} finally {
			setGenerating(false);
		}
	};

	const audioElevenLabsState = form.watch('audioElevenLabs');
	const romanianVoicelineState = form.watch('romanianVoiceline');
	const [generating, setGenerating] = useState(false);

	return (
		<Card className={`w-full px-4 py-4 flex flex-col gap-6 ${notMakingState && 'bg-destructive/10 opacity-50'} ${audioElevenLabsState && romanianVoicelineState ? 'bg-success/30' : ''}`}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
					<div className="flex flex-row gap-2">
						<div className="flex flex-col gap-2 flex-1">
							<FormField
								control={form.control}
								name="englishVoiceline"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<div className="flex flex-row gap-2">
											<FormLabel>EN:</FormLabel>
											<FormControl>
												<Input {...field} disabled />
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="romanianVoiceline"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<div className="flex flex-row gap-2">
											<FormLabel>RO:</FormLabel>
											<FormControl>
												<Input {...field} disabled={notMakingState} />
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Card
							className="p-2 flex items-center justify-center cursor-pointer"
							onClick={() => {
								console.log('Voiceline:');
								console.log(voiceline);
								console.log('Form:');
								console.log(form.getValues());
							}}
						>{`${voiceline.audioTF2Wiki.split('/').pop()?.replace('.wav', '.mp3')}`}</Card>
					</div>

					<div className="flex flex-row gap-4">
						<div className="flex-1 flex flex-col gap-2">
							<div className="flex flex-row gap-2">
								<FormLabel>EN:</FormLabel>
								{voiceline.audioTF2Wiki && (
									<audio controls className="w-full">
										<source src={voiceline.audioTF2Wiki} type="audio/mpeg" />
									</audio>
								)}
							</div>
							<div className="flex flex-row gap-2">
								<FormLabel>RO:</FormLabel>
								{generating ? (
									<Card className="w-full h-12 flex items-center justify-center rounded-4xl">
										<p>Generating...</p>
									</Card>
								) : audioElevenLabsState ? (
									<audio controls className="w-full">
										<source src={audioElevenLabsState} type="audio/mpeg" />
									</audio>
								) : (
									<Card className="w-full h-12 flex items-center justify-center rounded-4xl">
										<p>No audio available</p>
									</Card>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 grid-rows-2 gap-2">
							<FormField
								control={form.control}
								name="customSaveLocation"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormControl>
											<Input placeholder="Custom save location" {...field} disabled={notMakingState} className="h-full" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" variant="success" className="h-full cursor-pointer">
								Save
							</Button>
							<Button onClick={async () => await generateVoiceline()} type="button" variant="outline" className="h-full cursor-pointer" disabled={notMakingState}>
								Generate Voice Line
							</Button>
							{notMakingState ? (
								<Button type="button" className="h-full cursor-pointer bg-yellow-500 hover:bg-yellow-600" onClick={() => form.setValue('notMaking', false)}>
									Bring back
								</Button>
							) : (
								<Button type="button" variant="destructive" className="h-full cursor-pointer" onClick={() => form.setValue('notMaking', true)}>
									Mark as not making
								</Button>
							)}
						</div>
					</div>
				</form>
			</Form>
		</Card>
	);
};
