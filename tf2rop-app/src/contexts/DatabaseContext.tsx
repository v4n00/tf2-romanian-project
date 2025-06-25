import type { Database } from '@/models';
import React, { createContext, useContext, useState } from 'react';

export const DatabaseContext = createContext<{
	database: Database | null;
	setDatabase: (database: Database) => void;
}>({
	database: null,
	setDatabase: () => {},
});

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
	const [database, setDatabase] = useState<Database | null>(null);

	return <DatabaseContext.Provider value={{ database, setDatabase }}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = () => useContext(DatabaseContext);
