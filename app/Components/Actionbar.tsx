import { IconFolderPlus, IconFolderSymlink, IconPlus, IconTrash } from "@tabler/icons-react";
import { TaskItemModifications, TaskLocation } from "@/app/util/types/types";
import MoveInputDialog from "@/app/Components/MoveInputDialog";
import { Doc } from "@/convex/_generated/dataModel";
import Constants from "@/app/util/constants";
import { Actions } from "@/app/util/types/typeUtilities";

interface ActionbarProps {
	projects: Doc<"projects">[];
	universes: Doc<"universes">[];
	taskFolders: Doc<"taskFolders">[];

	isFilterView?: boolean;
	isTaskItemSelected?: boolean;

	taskItemActions: Actions<
		() => Promise<void>,
		null,
		null
	>;
	taskFolderActions: Actions<
		() => Promise<void>,
		null,
		null
	>;

	selectedTaskItemActions: Actions<
		null,
		(mods: TaskItemModifications) => Promise<void>,
		() => Promise<void>
	>,
}

export default function Actionbar({
	projects,
	universes,
	taskFolders,

	isFilterView,
	isTaskItemSelected,

	taskItemActions,
	taskFolderActions,

	selectedTaskItemActions,
}: ActionbarProps) {
	return (
		<div className="min-h-12 bg-slate-800 border-t border-slate-700 flex flex-row justify-center items-center gap-10">
			<button
				className="disabled:opacity-50"
				onClick={taskItemActions.create}
			>
				<IconPlus size={20} />
			</button>

			<button
				className="disabled:opacity-50"
				onClick={taskFolderActions.create}
				disabled={isFilterView}
			>
				<IconFolderPlus size={20} />
			</button>

			<div className="h-1/2 w-[1px] bg-slate-700" />

			<MoveInputDialog
				locations={[
					...taskFolders.map(
						(folder) => ({
							kind: "taskFolder" as const,
							id: folder._id,
							title: folder.title,
							iconName: "IconFolder",
						}),
					),
					...universes.map(
						(universe) => ({
							kind: "universe" as const,
							id: universe._id,
							title: universe.title,
							iconName: universe.iconName ?? "", // FIXME
						}),
					),
					...projects.map(
						(project) => ({
							kind: "project" as const,
							id: project._id,
							title: project.title,
							iconName: Constants.DynamicIcons.PROJECT(project.color).name,
						}),
					),
				]}
				move={(loc: TaskLocation | null) => {
					if (loc === null) {
						selectedTaskItemActions.modify({
							parentTaskFolder: null,
						});
						return;
					}
					switch (loc.kind) {
						case "taskFolder":
							selectedTaskItemActions.modify({
								parentTaskFolder: loc.id,
							});
							break;
						case "project":
							selectedTaskItemActions.modify({
								parentProject: loc.id,
							});
							break;
						case "universe":
							selectedTaskItemActions.modify({
								parentUniverse: loc.id,
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
				onClick={selectedTaskItemActions.delete}
				disabled={!isTaskItemSelected}
			>
				<IconTrash size={20} />
			</button>
		</div>
	);
}
