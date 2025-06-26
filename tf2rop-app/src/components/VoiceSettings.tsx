import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Toggle } from './ui/toggle';

export const VoiceSettings = () => {
	const { voiceSettings } = useVoiceSettings();
	if (!voiceSettings) {
		return null;
	}

	return (
		<div className="flex flex-col">
			<div className="flex flex-col">
				<Label htmlFor="speed">Speed: {voiceSettings.speed}</Label>
				<Slider
					id="speed"
					onValueChange={(e) => {
						voiceSettings.setSpeed(e[0]);
					}}
					defaultValue={[voiceSettings.speed]}
					min={0.7}
					max={1.2}
					step={0.01}
					className="w-full cursor-pointer py-2"
				/>
			</div>
			<div className="flex flex-col">
				<Label htmlFor="stability">Stability: {voiceSettings.stability}</Label>
				<Slider
					id="stability"
					onValueChange={(e) => {
						voiceSettings.setStability(e[0]);
					}}
					defaultValue={[voiceSettings.stability]}
					min={0}
					max={1}
					step={0.01}
					className="w-full cursor-pointer py-2"
				/>
			</div>
			<div className="flex flex-col">
				<Label htmlFor="similarity">Similarity: {voiceSettings.similarity}</Label>
				<Slider
					id="similarity"
					onValueChange={(e) => {
						voiceSettings.setSimilarity(e[0]);
					}}
					defaultValue={[voiceSettings.similarity]}
					min={0}
					max={1}
					step={0.01}
					className="w-full cursor-pointer py-2"
				/>
			</div>
			<div className="flex flex-col">
				<Label htmlFor="style">Style: {voiceSettings.style}</Label>
				<Slider
					id="style"
					onValueChange={(e) => {
						voiceSettings.setStyle(e[0]);
					}}
					defaultValue={[voiceSettings.style]}
					min={0}
					max={1}
					step={0.01}
					className="w-full cursor-pointer py-2"
				/>
			</div>

			<div className="flex flex-col">
				<Toggle
					onPressedChange={(pressed) => {
						voiceSettings.setUseSpeakerBoost(pressed);
					}}
					variant="outline"
				>
					Speaker Boost
				</Toggle>
			</div>
		</div>
	);
};
