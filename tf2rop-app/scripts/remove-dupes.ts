import * as fs from 'fs';
import * as path from 'path';
import { Database, Voiceline } from '../src/models';

function removeDuplicates(inputFile: string = '../../workdir/database.json', outputFile: string = '../../workdir/database2.json'): void {
	console.log('Reading database file...');
	const startTime = Date.now();

	// Read the database file
	const filePath = path.resolve(__dirname, inputFile);
	const rawData = fs.readFileSync(filePath, 'utf-8');
	const database: Database = JSON.parse(rawData);

	// Track seen audio files - using Set for O(1) lookup
	const seenAudioFiles = new Set<string>();
	let totalVoicelines = 0;
	let duplicatesRemoved = 0;

	console.log('Processing voicelines...');

	// Process each class
	for (const className in database) {
		const classData = database[className];

		// Process each category
		for (const categoryName in classData) {
			const category = classData[categoryName];

			// Process each subcategory
			for (const subcategoryName in category) {
				const subcategory = category[subcategoryName];
				const originalLength = subcategory.length;
				totalVoicelines += originalLength;

				// Filter out duplicates, keeping only first occurrence
				const filteredVoicelines: Voiceline[] = [];

				for (const voiceline of subcategory) {
					if (!seenAudioFiles.has(voiceline.audioTF2Wiki)) {
						// First occurrence - keep it
						seenAudioFiles.add(voiceline.audioTF2Wiki);
						filteredVoicelines.push(voiceline);
					} else {
						// Duplicate - skip it
						duplicatesRemoved++;
						console.log(`Removing duplicate: ${voiceline.english} (${voiceline.audioTF2Wiki})`);
					}
				}

				// Update the subcategory with filtered voicelines
				category[subcategoryName] = filteredVoicelines;

				const removedFromSubcategory = originalLength - filteredVoicelines.length;
				if (removedFromSubcategory > 0) {
					console.log(`${className} > ${categoryName} > ${subcategoryName}: Removed ${removedFromSubcategory} duplicates (${filteredVoicelines.length}/${originalLength} remaining)`);
				}
			}
		}
	}

	console.log('Writing cleaned database...');

	// Write the cleaned database back to file
	const outputPath = path.resolve(__dirname, outputFile);
	fs.writeFileSync(outputPath, JSON.stringify(database, null, 2), 'utf-8');

	const endTime = Date.now();
	const processingTime = endTime - startTime;

	console.log('\n=== Duplicate Removal Complete ===');
	console.log(`Total voicelines processed: ${totalVoicelines}`);
	console.log(`Duplicates removed: ${duplicatesRemoved}`);
	console.log(`Remaining voicelines: ${totalVoicelines - duplicatesRemoved}`);
	console.log(`Processing time: ${processingTime}ms`);
	console.log(`Output saved to: ${outputPath}`);

	// Show some statistics about unique audio files
	console.log(`\nUnique audio files: ${seenAudioFiles.size}`);
}

// Run the script
if (require.main === module) {
	try {
		console.log('Starting duplicate removal process...');
		removeDuplicates();
		console.log('Script completed successfully!');
	} catch (error) {
		console.error('Error removing duplicates:', error);
		if (error instanceof Error) {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

export { removeDuplicates };
