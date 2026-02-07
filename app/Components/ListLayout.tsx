import { Doc, Id } from "@/convex/_generated/dataModel";
import TaskItemLayout from "@/app/Components/TaskItemLayout";
import {
	Block, FilterView,
	ProjectView,
	TaskFolderModifications,
	TaskItemModifications,
	UniverseView,
} from "@/app/util/types/types";
import { IconChevronRight, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import RichIcon from "@/app/Components/RichIcon";
import Constants from "@/app/util/constants";
import { ViewId } from "@/app/util/types/baseTypes";
import { Actions } from "@/app/util/types/typeUtilities";

interface ListLayoutProps {
	blocks: Block[];

	view: UniverseView | ProjectView | FilterView;

	selectedTaskItem: Id<"taskItems"> | null;
	setSelectedTaskItem: (itemId: Id<"taskItems"> | null) => void;
	setSelectedViewId: (viewId: ViewId) => void;

	taskItemActions: Actions<
		(taskFolderId?: Id<"taskFolders">) => void,
		(taskId: Id<"taskItems">, modifications: TaskItemModifications) => void,
		null
	>;
	taskFolderActions: Actions<
		null,
		(id: Id<"taskFolders">, mods: TaskFolderModifications) => void,
		(id: Id<"taskFolders">) => void
	>;
}

export default function ListLayout(props: ListLayoutProps) {
	return (
		<div>
			{props.blocks.map((block) => (
				<BlockRenderer key={block.value._id} block={block} {...props} />
			))}
		</div>
	);
}

function BlockRenderer({
	block,
	view,
	selectedTaskItem,
	setSelectedTaskItem,
	setSelectedViewId,

	taskItemActions,
	taskFolderActions,
}: {
	block: Block;
} & Omit<ListLayoutProps, "blocks">) {
	const [editingFolderId, setEditingFolderId] = useState<Id<"taskFolders"> | null>(null);
	const [tempFolderTitle, setTempFolderTitle] = useState("");

	if (block.kind === "project") {
		return (
			<div className="mt-8 select-none rounded-md">
				<div className="group flex flex-row items-center gap-4 px-3">
					<RichIcon
						iconData={Constants.DynamicIcons.PROJECT(block.value.color)}
						size={24}
					/>

					<div className="flex flex-row gap-1 items-center">
						<h2 className="text-xl font-bold">{block.value.title}</h2>
						<button
							className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white duration-100"
							onClick={() => setSelectedViewId(block.value._id)}
						>
							<IconChevronRight size={24} />
						</button>
					</div>
				</div>

				<hr className="mt-2 mb-4 border-slate-700" />

				{block.children.map((child) => (
					<BlockRenderer
						key={child.value._id}
						block={child}
						view={view}

						selectedTaskItem={selectedTaskItem}
						setSelectedTaskItem={setSelectedTaskItem}
						setSelectedViewId={setSelectedViewId}

						taskFolderActions={taskFolderActions}
						taskItemActions={taskItemActions}
					/>
				))}
			</div>
		);
	}

	if (block.kind === "taskFolder") {
		const folder = block.value as Doc<"taskFolders">;

		return (
			<div className="mt-8 select-none">
				<div className="group flex justify-between px-4">
					{editingFolderId !== folder._id ?
						<div className="flex flex-row gap-1 items-center">
							<h2 className="text-xl font-bold">{folder.title}</h2>
							<button
								className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white duration-100"
								onClick={() => taskItemActions.create(folder._id)}
							>
								<IconPlus size={24} />
							</button>
						</div>
					:	<div className="flex gap-2">
							<input
								className="text-xl font-bold bg-slate-800 text-white rounded-md px-2 py-1"
								value={tempFolderTitle}
								autoFocus
								onChange={(e) => setTempFolderTitle(e.target.value)}
							/>
							<button
								onClick={() => {
									taskFolderActions.modify(folder._id, {
										title: tempFolderTitle,
									});
									setEditingFolderId(null);
									setTempFolderTitle("");
								}}
							>
								Save
							</button>
						</div>
					}

					<div className="flex gap-2">
						<button
							className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white duration-100"
							onClick={() => {
								setEditingFolderId(folder._id);
								setTempFolderTitle(folder.title);
							}}
						>
							<IconPencil size={16} />
						</button>
						<button
							className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 duration-100"
							onClick={() => taskFolderActions.delete(folder._id)}
						>
							<IconTrash size={16} />
						</button>
					</div>
				</div>

				<hr className="mt-2 mb-4 border-slate-700" />

				{block.children.map((child) => (
					<BlockRenderer
						key={child.value._id}
						block={child}
						view={view}

						selectedTaskItem={selectedTaskItem}
						setSelectedTaskItem={setSelectedTaskItem}
						setSelectedViewId={setSelectedViewId}

						taskFolderActions={taskFolderActions}
						taskItemActions={taskItemActions}
					/>
				))}
			</div>
		);
	}

	if (block.kind === "taskItem") {
		const item = block.value as Doc<"taskItems">;

		return (
			<TaskItemLayout
				taskItem={item}
				isSelected={selectedTaskItem === item._id}
				showTodayIcon={view.kind !== "systemFilter" || view.id !== "today"}
				thisActions={{
					create: null,
					modify: taskItemActions.modify.bind(null, item._id),
					delete: null,
				}}
				selectThis={() => setSelectedTaskItem(item._id)}
			/>
		);
	}

	return null; // project ignored for now
}
