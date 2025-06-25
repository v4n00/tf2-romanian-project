import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

interface VoiceLine {
	id: number;
	english: string;
	romanianTranslation: string;
	customSaveLocation: string;
	audioTF2Wiki: string;
	audioElevenLabs: string;
	notMaking: boolean;
}

type SubCategoryMap = Record<string, VoiceLine[]>;
type CategoryMap = Record<string, SubCategoryMap>;
type CharacterMap = Record<string, CategoryMap>;

let globalId = 1;

async function scrapeTF2Wiki(url: string, characterName: string, type: string): Promise<void> {
	const { data: html } = await axios.get(url);
	const $ = cheerio.load(html);
	const characterData: CharacterMap = { [characterName]: {} };

	$('h2 .mw-headline').each((_, headline) => {
		const categoryId = $(headline).attr('id') || '';
		const categoryTitle = $(headline).text().trim();
		console.log(`Processing category: ${categoryTitle}`);
		if (!categoryId || !categoryTitle) return;

		const category: SubCategoryMap = {};
		let element = $(headline).parent().next();

		while (element.length && element[0].tagName !== 'h2') {
			if (element.is('table')) {
				let subCategoryHeaderElement: string;
				if (type === 'taunts') {
					subCategoryHeaderElement = 'td';
				} else if (type === 'voice_commands') {
					subCategoryHeaderElement = 'td.gradient';
				} else {
					subCategoryHeaderElement = 'td.gradient b'; // "responses"
				}
				const subCategoryHeader = element.find(subCategoryHeaderElement).first();
				const subCategoryTitle = subCategoryHeader.text().trim();
				console.log(`Processing sub-category: ${subCategoryTitle} in category: ${categoryTitle}`);
				const voiceLines: VoiceLine[] = [];

				let voiceLineElements = 'li a.internal';
				if (type === 'taunts') {
					voiceLineElements = 'dd a.internal';
				}

				element.find(voiceLineElements).each((_, link) => {
					const voiceText = $(link).text().replace(/["“”]/g, '').trim();
					const audioHref = $(link).attr('href')?.trim() || '';

					if (audioHref) {
						voiceLines.push({
							id: globalId++,
							english: voiceText,
							romanianTranslation: '',
							customSaveLocation: '',
							audioTF2Wiki: 'https://wiki.teamfortress.com' + audioHref,
							audioElevenLabs: '',
							notMaking: false,
						});
					}
				});

				if (voiceLines.length > 0 && subCategoryTitle) {
					category[subCategoryTitle] = voiceLines;
				}
			}
			element = element.next();
		}

		if (Object.keys(category).length > 0) {
			characterData[characterName][categoryTitle] = category;
		}
	});

	const outputFilename = `${characterName}.json`;
	fs.writeFileSync(outputFilename, JSON.stringify(characterData, null, 2), 'utf-8');
	console.log(`Scraped data saved to ${outputFilename}`);
}

const types = ['voice_commands', 'responses', 'taunts'];
const classes = ['Scout', 'Soldier', 'Pyro', 'Demoman', 'Heavy', 'Engineer', 'Medic', 'Sniper', 'Spy', 'Administrator'];
const classesRO = ['Cercetasul', 'Soldatul', 'Piromanul', 'Demolitianul', 'Greul', 'Inginerul', 'Medic', 'Lunetistul', 'Spionul', 'Administratorul'];

// const characterName = 'Cercetasul3';
// const wikiUrl = 'https://wiki.teamfortress.com/wiki/Scout_taunts';
// const type = 'taunts'; // "responses" or "voice_commands" or "taunts"

for (let i = 0; i < classes.length; i++) {
	for (let j = 0; j < 3; j++) {
		const characterName = classesRO[i] + j;
		const wikiUrl = `https://wiki.teamfortress.com/wiki/${classes[i]}_${types[j]}`;
		const type = types[j]; // "taunts", "responses", or "voice_commands"
		if (i === 10 && (j === 0 || j === 2)) continue;
		scrapeTF2Wiki(wikiUrl, characterName, type).catch(console.error);
	}
}

// scrapeTF2Wiki(wikiUrl, characterName, type).catch(console.error);
