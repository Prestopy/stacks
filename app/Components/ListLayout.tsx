import { Doc, Id } from "@/convex/_generated/dataModel";
import TaskItemLayout from "@/app/Components/TaskItemLayout";
import {
	TaskFolderModifications,
	TaskItemModifications,
} from "@/app/util/types";
import { Button } from "@/components/ui/button";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

interface Block {
	folder: { title: string; id: Id<"taskFolders"> } | null;
	items: Doc<"taskItems">[];
}

interface ListLayoutProps {
	isFilterLayout: boolean;
	taskFolders: Doc<"taskFolders">[];

	taskItems: Doc<"taskItems">[];
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

export default function ListLayout({
	isFilterLayout,
	taskFolders,
	taskItems,
	selectedTaskItem,
	setSelectedTaskItem,

	modifyTaskItem,

	modifyTaskFolder,
	deleteTaskFolder,
}: ListLayoutProps) {
	const [editingFolderId, setEditingFolderId] =
		useState<Id<"taskFolders"> | null>(null);
	const [tempFolderTitle, setTempFolderTitle] = useState<string>("");
	let blocks: Block[] = [];

	// Unfiled tasks
	if (!isFilterLayout) {
		const unfiledItems = taskItems.filter(
			(item) => item.parentTaskFolder === undefined,
		);
		blocks.push({ folder: null, items: unfiledItems });

		// Tasks in folders
		taskFolders.forEach((folder) => {
			const itemsInFolder = taskItems.filter(
				(item) => item.parentTaskFolder === folder._id,
			);
			blocks.push({
				folder: { title: folder.title, id: folder._id },
				items: itemsInFolder,
			});
		});
	} else {
		blocks = [{ folder: null, items: taskItems }];
	}

	const handleFolderTitleChange = (
		folderId: Id<"taskFolders">,
		newTitle: string,
	) => {
		modifyTaskFolder(folderId, {
			title: newTitle,
		});
	};

	const handleDeleteFolder = (folderId: Id<"taskFolders">) => {
		deleteTaskFolder(folderId);
	};

	return (
		<div>
			{blocks.map((block, index) => (
				<div key={index} className="mb-8">
					{block.folder && (
						<div className="select-none">
							<div className="group flex flex-row justify-between">
								{editingFolderId !== block.folder.id ?
									<h2 className="text-xl font-bold">
										{block.folder.title}
									</h2>
								:	<div className="flex flex-row gap-2">
										<input
											type="text"
											className="text-xl font-bold bg-slate-800 text-white rounded-md px-2 py-1 w-full max-w-xs"
											value={tempFolderTitle}
											onChange={(e) => {
												setTempFolderTitle(
													e.target.value,
												);
											}}
											autoFocus
										/>
										<button
											className="flex-1 px-4 text-sm hover:bg-slate-700 bg-slate-800 duration-100 rounded-md"
											onClick={() => {
												// Handle title change
												if (block.folder) {
													handleFolderTitleChange(
														block.folder.id,
														tempFolderTitle,
													);
													setTempFolderTitle("");
													setEditingFolderId(null);
												}
											}}
										>
											Save
										</button>
									</div>
								}

								<div className="flex flex-row gap-2">
									<button
										className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white duration-100"
										onClick={() => {
											if (block.folder) {
												setEditingFolderId(
													block.folder.id,
												);
												setTempFolderTitle(
													block.folder.title,
												);
											}
										}}
									>
										<IconPencil size={16} />
									</button>
									<button
										className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 duration-100"
										onClick={() => {
											if (block.folder) {
												handleDeleteFolder(
													block.folder.id,
												);
												setEditingFolderId(null);
											}
										}}
									>
										<IconTrash size={16} />
									</button>
								</div>
							</div>

							<hr
								className={`mb-4 ${editingFolderId !== block.folder.id ? "border-slate-700" : "border-slate-800"} duration-500`}
							/>
						</div>
					)}

					{block.items.map((item) => (
						<TaskItemLayout
							key={item._id}
							taskItem={item}
							isSelected={selectedTaskItem == item._id}
							modifyThis={(modifications) =>
								modifyTaskItem(item._id, modifications)
							}
							selectThis={() => setSelectedTaskItem(item._id)}
						/>
					))}
				</div>
			))}
		</div>
	);
}
