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

async function scrapeTF2Wiki(url: string, characterName: string): Promise<void> {
	const { data: html } = await axios.get(url);
	const $ = cheerio.load(html);
	const characterData: CharacterMap = { [characterName]: {} };

	$('h2 .mw-headline').each((_, headline) => {
		const categoryId = $(headline).attr('id') || '';
		const categoryTitle = $(headline).text().trim();
		if (!categoryId || !categoryTitle) return;

		const category: SubCategoryMap = {};
		let element = $(headline).parent().next();

		while (element.length && element[0].tagName !== 'h2') {
			if (element.is('table')) {
				const subCategoryHeader = element.find('td.gradient b').first();
				const subCategoryTitle = subCategoryHeader.text().trim();
				const voiceLines: VoiceLine[] = [];

				element.find('li a.internal').each((_, link) => {
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

// Example usage:
const characterName = process.argv[3];
const wikiUrl = process.argv[2];

if (!wikiUrl) {
	console.error('Usage: ts-node scrape.ts <wikiUrl> <characterName>');
	process.exit(1);
}

scrapeTF2Wiki(wikiUrl, characterName).catch(console.error);
// ts-node scrape.ts "https://wiki.teamfortress.com/wiki/Scout_responses" Cercetasul
