import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import RichIcon from "@/app/Components/RichIcon";
import { TaskLocation } from "@/app/util/types/types";

interface LocationSelectorProps {
	open: boolean;
	locations: TaskLocation[];
	move: (loc: TaskLocation | null) => void;
}
export default function LocationSelector({
	open,
	locations,
	move,
}: LocationSelectorProps) {
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		setSearchTerm("");
	}, [open]);

	const filteredLocations = locations.filter((l) => {
		return l.title.toLowerCase().includes(searchTerm.toLowerCase());
	});

	return (
		<div className="flex flex-col">
			<input
				type="text"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && filteredLocations.length > 0) {
						move(filteredLocations[0]);
					}
				}}
				placeholder="Where..."
				autoFocus
				className="w-full py-2 placeholder-muted-foreground text-sm text-center"
			/>
			{filteredLocations.length > 0 ?
				<div className="flex flex-col px-2 mb-2">
					{filteredLocations.map((location) => (
						<button
							key={location.id}
							className={`px-2 py-1 text-sm disabled:opacity-50 not-disabled:hover:bg-slate-800 text-center w-full flex flex-row gap-2 justify-center items-center duration-100 rounded-sm`}
							onClick={() => move(location)}
						>
							<RichIcon
								iconData={{
									name: location.iconName,
								}}
								size={16}
							/>
							{location.title}
						</button>
					))}
				</div>
			:	null}
			<div className="px-2">
				<button
					className="px-2 py-1 text-sm text-slate-400 hover:text-red-500 text-center w-full flex flex-row gap-2 justify-center items-center hover:bg-slate-800 duration-100 rounded-sm"
					onClick={() => {
						move(null);
					}}
				>
					<IconTrash size={16} />
					Clear
				</button>
			</div>
		</div>
	);
}
