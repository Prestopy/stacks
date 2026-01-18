import { Doc, Id } from "@/convex/_generated/dataModel";
import TaskItemLayout from "@/app/Components/TaskItemLayout";
import {
	Block,
	TaskFolderModifications,
	TaskItemModifications,
} from "@/app/util/types";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import RichIcon from "@/app/Components/RichIcon";
import Constants from "@/app/util/constants";

interface ListLayoutProps {
	isFilterLayout: boolean;

	blocks: Block[];

	selectedTaskItem: Id<"taskItems"> | null;
	setSelectedTaskItem: (itemId: Id<"taskItems"> | null) => void;

	modifyTaskItem: (
		taskId: Id<"taskItems">,
		modifications: TaskItemModifications,
	) => void;

	modifyTaskFolder: (
		folderId: Id<"taskFolders">,
		mods: TaskFolderModifications,
	) => void;
	deleteTaskFolder: (id: Id<"taskFolders">) => void;
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
	                       selectedTaskItem,
	                       setSelectedTaskItem,
	                       modifyTaskItem,
	                       modifyTaskFolder,
	                       deleteTaskFolder,
                       }: {
	block: Block
} & Omit<ListLayoutProps, "blocks" | "isFilterLayout">) {
	const [editingFolderId, setEditingFolderId] =
		useState<Id<"taskFolders"> | null>(null);
	const [tempFolderTitle, setTempFolderTitle] = useState("");

	if (block.kind === "project") {
		return (
			<div className="mt-8 select-none rounded-md">
				<div className="flex flex-row items-center gap-4 px-3">
					<RichIcon iconData={Constants.DynamicIcons.PROJECT(
						block.value.color,
					)} size={24} />

					<h2 className='text-xl font-bold'>{block.value.title}</h2>
				</div>

				<hr className="mt-2 mb-4 border-slate-700" />

				{block.children.map((child) => (
					<BlockRenderer
						key={child.value._id}
						block={child}
						selectedTaskItem={selectedTaskItem}
						setSelectedTaskItem={setSelectedTaskItem}
						modifyTaskItem={modifyTaskItem}
						modifyTaskFolder={modifyTaskFolder}
						deleteTaskFolder={deleteTaskFolder}
					/>
				))}
			</div>
		)
	}

	if (block.kind === "taskFolder") {
		const folder = block.value as Doc<"taskFolders">;

		return (
			<div className="mt-8 select-none">
				<div className="group flex justify-between px-4">
					{editingFolderId !== folder._id ? (
						<h2 className="text-xl font-bold">{folder.title}</h2>
					) : (
						<div className="flex gap-2">
							<input
								className="text-xl font-bold bg-slate-800 text-white rounded-md px-2 py-1"
								value={tempFolderTitle}
								autoFocus
								onChange={(e) => setTempFolderTitle(e.target.value)}
							/>
							<button
								onClick={() => {
									modifyTaskFolder(folder._id, {
										title: tempFolderTitle,
									});
									setEditingFolderId(null);
									setTempFolderTitle("");
								}}
							>
								Save
							</button>
						</div>
					)}

					<div className="flex gap-2">
						<button
							className="opacity-0 group-hover:opacity-100"
							onClick={() => {
								setEditingFolderId(folder._id);
								setTempFolderTitle(folder.title);
							}}
						>
							<IconPencil size={16} />
						</button>
						<button
							className="opacity-0 group-hover:opacity-100 text-red-500"
							onClick={() => deleteTaskFolder(folder._id)}
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
						selectedTaskItem={selectedTaskItem}
						setSelectedTaskItem={setSelectedTaskItem}
						modifyTaskItem={modifyTaskItem}
						modifyTaskFolder={modifyTaskFolder}
						deleteTaskFolder={deleteTaskFolder}
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
				modifyThis={(mods) => modifyTaskItem(item._id, mods)}
				selectThis={() => setSelectedTaskItem(item._id)}
			/>
		);
	}

	return null; // project ignored for now
}
