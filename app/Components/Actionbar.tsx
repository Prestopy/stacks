import { IconFolderPlus, IconFolderSymlink, IconPlus, IconTrash } from "@tabler/icons-react";
import { TaskItemModifications, TaskLocation } from "@/app/util/types";
import MoveInputDialog from "@/app/Components/MoveInputDialog";
import { Doc } from "@/convex/_generated/dataModel";

interface ActionbarProps {
	taskFolders: Doc<"taskFolders">[];

	isFilterView?: boolean;
	isTaskItemSelected?: boolean;

	createTaskItem: () => Promise<void>;
	createTaskFolder: () => Promise<void>;

	modifySelectedTaskItem: (mods: TaskItemModifications) => void,
	deleteSelectedTaskItem: () => Promise<void>;
}

export default function Actionbar({
	taskFolders,

	isFilterView,
	isTaskItemSelected,
	createTaskItem,
	createTaskFolder,

	modifySelectedTaskItem,
	deleteSelectedTaskItem,
}: ActionbarProps) {
	return (
		<div className="min-h-12 bg-slate-800 border-t border-slate-700 flex flex-row justify-center items-center gap-10">
			<button onClick={createTaskItem}>
				<IconPlus size={20} />
			</button>

			<button
				onClick={createTaskFolder}
				disabled={isFilterView}
			>
				<IconFolderPlus size={20} />
			</button>

			<div className="h-1/2 w-[1px] bg-slate-700" />

			<MoveInputDialog
				locations={taskFolders.map(
					(folder) => ({
						kind: "folder",
						_id: folder._id,
						title: folder.title,
						iconName: "IconFolder",
					}),
				)}
				move={(loc: TaskLocation | null) => {
					if (loc === null) {
						modifySelectedTaskItem({
							parentTaskFolder: null,
						});
						return;
					}
					switch (loc.kind) {
						case "folder":
							modifySelectedTaskItem({
								parentTaskFolder: loc._id,
							});
							break;
						case "project":
							modifySelectedTaskItem({
								parentProject: loc._id,
							});
							break;
						case "universe":
							modifySelectedTaskItem({
								parentUniverse: loc._id,
							});
							break;
					}
				}}
			>
				<button
					className="disabled:opacity-50"
					disabled={!isTaskItemSelected}
				>
					<IconFolderSymlink size={20} />
				</button>
			</MoveInputDialog>

			{/*FIXME: Able to perform actions on selected task even if it isn't in the current view*/}
			<button
				className="disabled:opacity-50"
				onClick={deleteSelectedTaskItem}
				disabled={!isTaskItemSelected}
			>
				<IconTrash size={20} />
			</button>
		</div>
	);
}
