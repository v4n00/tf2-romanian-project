const saveDatabase = async (updatedDatabase: Database) => {
	if (!directoryHandle) return;
	try {
		const fileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
		const writable = await fileHandle.createWritable();
		await writable.write(JSON.stringify(updatedDatabase, null, 2));
		await writable.close();
		setDatabase(updatedDatabase); // update state as well
	} catch (e) {
		console.error('Failed to save database:', e);
	}
};
