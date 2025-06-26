import type { Clasa, SubCategory, Voiceline } from '@/models';
import { CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { VoicelineContainer } from './VoiceLineContainer';

export const CategoryContainer = ({ categoryName, subcategory, clasa }: { categoryName: string; subcategory: SubCategory; clasa: (typeof Clasa)[number] }) => {
	return (
		<Card className="px-2 w-full py-0 my-2 mr-5">
			<Collapsible>
				<CollapsibleTrigger className="flex flex-row cursor-pointer w-full py-4">
					{categoryName} <ChevronDown />
				</CollapsibleTrigger>
				<CollapsibleContent className="mt-2 flex flex-col gap-2">
					{Object.entries(subcategory).map(([subcategoryName, subCategory]) => (
						<div key={subcategoryName} className="flex flex-col gap-2">
							<h3 className="text-lg font-semibold">{subcategoryName}</h3>
							<div className="flex flex-row gap-2">
								<div className="max-h-full bg-primary w-2 rounded" />
								<div className="w-full flex flex-col gap-2">
									{Object.entries(subCategory).map(([voicelineName, voiceline]) => (
										<VoicelineContainer key={voicelineName} voiceline={voiceline as Voiceline} clasa={clasa} category={categoryName} subcategory={subcategoryName} />
									))}
								</div>
							</div>
						</div>
					))}
				</CollapsibleContent>
			</Collapsible>
		</Card>
	);
};
