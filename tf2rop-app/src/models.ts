export const Clasa = ['Cercetasul', 'Soldatul', 'Piromanul', 'Demolitianul', 'Greul', 'Inginerul', 'Medic', 'Lunetistul', 'Spionul', 'Administratorul'];

export interface Voiceline {
	id: number;
	english: string;
	romanianTranslation: string;
	customSaveLocation: string;
	audioTF2Wiki: string;
	audioElevenLabs: string;
	notMaking: boolean;
}

export type SubCategory = {
	[subcategoryName: string]: Voiceline[];
};

export type Category = {
	[categoryName: string]: SubCategory;
};

export interface Database {
	[className: (typeof Clasa)[number]]: Category;
}
