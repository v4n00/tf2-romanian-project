import type { Clasa, Database, Voiceline } from '@/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

import { useDatabase } from '@/contexts/DatabaseContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

const formSchema = z.object({
	id: z.number().readonly(),
	englishVoiceline: z.string().optional(),
	romanianVoiceline: z.string().optional(),
	audioEnglishVoiceline: z.string().optional(),
	audioRomanianVoiceline: z.string().optional(),
	customSaveLocation: z.string().optional(),
	notMaking: z.boolean().optional(),
});

export const VoicelineContainer = ({ voiceline, clasa, category, subcategory }: { voiceline: Voiceline; clasa: (typeof Clasa)[number]; category: string; subcategory: string }) => {
	const { database, setDatabase } = useDatabase();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: voiceline.id,
			englishVoiceline: voiceline.english,
			romanianVoiceline: voiceline.romanianTranslation || '',
			audioEnglishVoiceline: voiceline.audioTF2Wiki || '',
			audioRomanianVoiceline: voiceline.audioElevenLabs || '',
			customSaveLocation: voiceline.customSaveLocation || '',
			notMaking: voiceline.notMaking || false,
		},
	});

	const notMakingState = form.watch('notMaking');

	function onSubmit(values: z.infer<typeof formSchema>) {
		const updatedVoiceline = {
			...voiceline,
			english: values.englishVoiceline,
			romanianTranslation: values.romanianVoiceline,
			audioTF2Wiki: values.audioEnglishVoiceline,
			audioElevenLabs: values.audioRomanianVoiceline,
			customSaveLocation: values.customSaveLocation,
			notMaking: values.notMaking,
		};

		if (!database) return;

		const updatedSubcategory = database[clasa][category][subcategory].map((line) => (line.id === voiceline.id ? updatedVoiceline : line));

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
		toast.success('Voice line updated successfully');
	}

	return (
		<Card className={`w-full px-4 py-6 flex flex-col gap-6 ${notMakingState && 'bg-destructive/10 opacity-50'}`}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
					<FormField
						control={form.control}
						name="englishVoiceline"
						render={({ field }) => (
							<FormItem>
								<FormLabel>English Voice Line</FormLabel>
								<FormControl>
									<Input {...field} disabled />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="romanianVoiceline"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Romanian Voice Line</FormLabel>
								<FormControl>
									<Input {...field} disabled={notMakingState} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex flex-row gap-4">
						<div className="flex-1 flex flex-col gap-2">
							<div className="flex flex-row gap-2">
								<FormLabel>EN:</FormLabel>
								{voiceline.audioTF2Wiki && (
									<audio controls className="w-full">
										<source src={voiceline.audioTF2Wiki} type="audio/mp3" />
									</audio>
								)}
							</div>
							<div className="flex flex-row gap-2">
								<FormLabel>RO:</FormLabel>
								{voiceline.audioElevenLabs ? (
									<audio controls className="w-full">
										<source src={voiceline.audioElevenLabs} type="audio/mp3" />
									</audio>
								) : (
									<Card className="w-full h-12 flex items-center justify-center rounded-4xl">
										<p>No audio</p>
									</Card>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 grid-rows-2 gap-2">
							<Button type="button" variant="outline" className="h-full cursor-pointer" disabled={notMakingState}>
								Change save location
							</Button>
							<Button type="submit" variant="success" className="h-full cursor-pointer">
								Save
							</Button>
							<Button type="button" variant="outline" className="h-full cursor-pointer" disabled={notMakingState}>
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
