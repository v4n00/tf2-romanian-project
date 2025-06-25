import * as fs from 'fs';
import * as path from 'path';

const classesRO = ['Cercetasul', 'Soldatul', 'Piromanul', 'Demolitianul', 'Greul', 'Inginerul', 'Medic', 'Lunetistul', 'Spionul', 'Administratorul'];

function combineFiles() {
	const files = fs.readdirSync('./'); // Current directory
	const combinedData: Record<string, any> = {};

	classesRO.forEach((className) => {
		const combinedClassData: Record<string, any> = {};
		const fileKeys =
			className === 'Administratorul'
				? [`${className}1`] // Administratorul has only file number 1
				: [`${className}0`, `${className}1`, `${className}2`];

		fileKeys.forEach((key) => {
			const fileName = `${key}.json`;
			if (files.includes(fileName)) {
				const filePath = path.resolve('./', fileName);
				const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

				// Get the class data from the file (e.g., fileData["Cercetasul0"])
				const classDataFromFile = fileData[key];

				if (classDataFromFile) {
					// Iterate through each category in this class file
					Object.entries(classDataFromFile).forEach(([categoryKey, categoryValue]) => {
						if (!combinedClassData[categoryKey]) {
							// If this category doesn't exist yet, create it
							combinedClassData[categoryKey] = categoryValue;
						} else {
							// If category exists, merge the subcategories
							Object.entries(categoryValue as Record<string, any>).forEach(([subKey, subValue]) => {
								if (!combinedClassData[categoryKey][subKey]) {
									combinedClassData[categoryKey][subKey] = subValue;
								} else {
									// If subcategory exists, merge the arrays
									if (Array.isArray(subValue) && Array.isArray(combinedClassData[categoryKey][subKey])) {
										combinedClassData[categoryKey][subKey].push(...subValue);
									}
								}
							});
						}
					});
				}
			}
		});

		if (Object.keys(combinedClassData).length > 0) {
			combinedData[className] = combinedClassData;
		}
	});

	fs.writeFileSync('./database.json', JSON.stringify(combinedData, null, 2), 'utf-8');
	console.log('Combined JSON has been created as "combined.json"');
}

combineFiles();
