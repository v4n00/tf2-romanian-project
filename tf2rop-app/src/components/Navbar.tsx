import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDatabase } from '@/contexts/DatabaseContext';
import { Clasa } from '@/models';
import { Save } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import { ApiKeyButton } from './ApiKeyButton';
import { Button } from './ui/button';
import { ModeToggle } from './ui/mode-toggle';

export const Navbar = ({ directoryHandle }: { directoryHandle: FileSystemDirectoryHandle | null }) => {
	const location = useLocation();
	const { database } = useDatabase();

	const handleSaveDatabase = async () => {
		if (!directoryHandle) {
			console.error('No directory handle available');
			return;
		}

		try {
			const fileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(JSON.stringify(database));
			await writable.close();
			toast.success('Database saved successfully!');
		} catch (error) {
			console.error('Error saving database:', error);
		}
	};

	return (
		<div className="h-16 border flex items-center gap-2 pl-2 sticky top-0 z-50 bg-background">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="w-50">Clasă: {location.pathname.split('/')[1] || 'Selectează'}</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{Clasa.map((clasa) => (
						<DropdownMenuItem key={clasa} asChild>
							<Link to={`/${clasa}`} className="text-sm">
								{clasa}
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<Button variant="success" onClick={handleSaveDatabase} disabled={!directoryHandle}>
				<Save />
				Save
			</Button>
			<ApiKeyButton />
			<ModeToggle />
		</div>
	);
};
