import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconX } from "@tabler/icons-react";
import LocationSelector from "@/app/Components/LocationSelector";
import { TaskLocation } from "@/app/util/types/types";
import { useState } from "react";
import * as React from "react";

interface MoveInputProps {
	locations: TaskLocation[];
	move: (loc: TaskLocation | null) => void;
	children?: React.ReactNode;
}
export default function MoveInputDialog({ locations, move, children }: MoveInputProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				asChild
				onSelect={
					(e) => e.preventDefault()
				}
			>
				{children}
			</DialogTrigger>
			<DialogContent className="[&>button]:hidden p-0 w-fit h-fit bg-slate-900">
				<DialogTitle className="hidden">Location selector</DialogTitle>
				<div className="flex flex-col">
					<LocationSelector
						open={open}
						locations={locations}
						move={(loc: TaskLocation | null) => {
							move(loc);
							setOpen(false);
						}}
					/>
					<div className="px-2 mb-2">
						<DialogClose
							className="px-2 py-1 text-sm text-slate-400 hover:text-white text-center w-full flex flex-row gap-2 justify-center items-center hover:bg-slate-800 duration-100 rounded-sm"
						>
							<IconX
								size={16}
							/>
							Cancel
						</DialogClose>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
