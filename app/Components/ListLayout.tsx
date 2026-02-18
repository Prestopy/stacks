import { Doc, Id } from "@/convex/_generated/dataModel";
import TaskItemLayout from "@/app/Components/TaskItemLayout";
import {
	Block, EmptyContainerBlock, FilterView, ProjectBlock,
	ProjectView, TaskFolderBlock,
	TaskFolderModifications, TaskItemBlock,
	TaskItemModifications,
	UniverseView,
} from "@/app/util/types/types";
import { IconChevronRight, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import RichIcon from "@/app/Components/RichIcon";
import Constants from "@/app/util/constants";
import { ViewId } from "@/app/util/types/baseTypes";
import { Actions } from "@/app/util/types/typeUtilities";
import { useDragDropMonitor, useDroppable } from "@dnd-kit/react";

interface ListLayoutProps {
	taskItems: Doc<"taskItems">[];
	taskFolders: Doc<"taskFolders">[];
	allProjects: Doc<"projects">[] | null;

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
	const { taskItems, taskFolders, allProjects, view } = props;
	const blocks = useMemo(() => {
		// All item blocks
		const itemBlocks: TaskItemBlock[] = taskItems.map((item) => ({
			kind: "taskItem" as const,
			value: item,
		}));

		if (view.kind === "project" || view.kind === "universe") {
			const folderBlocks: TaskFolderBlock[] = taskFolders.map((folder) => ({
				kind: "taskFolder" as const,
				value: folder,
				children: [],
			}));

			for (const folderBlock of folderBlocks) {
				// Find items in this folder
				folderBlock.children = itemBlocks.filter(
					(itemBlock) =>
						itemBlock.value.parentTaskFolder?.toString() ===
						folderBlock.value._id.toString(),
				);
			}

			// items not in folders
			const ungroupedItems = itemBlocks.filter(
				(itemBlock) => !itemBlock.value.parentTaskFolder,
			);

			if (ungroupedItems.length > 0) {
				const emptyBlock: EmptyContainerBlock = {
					kind: "emptyContainer" as const,
					value: null,
					children: ungroupedItems
				}

				return [emptyBlock, ...folderBlocks];
			} else return folderBlocks;
		} else {
			// filter (system) view
			// Folder blocks for any folders that contain items in the current view
			const folderBlocks: TaskFolderBlock[] = taskFolders.map((folder) => ({
				kind: "taskFolder" as const,
				value: folder,
				children: itemBlocks.filter(
					(itemBlock) =>
						itemBlock.value.parentTaskFolder?.toString() === folder._id.toString(),
				),
			}));

			// Project blocks only for projects that have items in the current view
			const projectBlocks: ProjectBlock[] = (allProjects ?? [])
				.map((project) => ({
					kind: "project" as const,
					value: project,
					children: itemBlocks.filter(
						(itemBlock) =>
							itemBlock.value.parentProject?.toString() === project._id.toString(),
					),
				}))
				.filter((pb) => pb.children.length > 0);

			// items not in projects and not in folders
			const ungroupedItems = itemBlocks.filter(
				(itemBlock) => !itemBlock.value.parentProject && !itemBlock.value.parentTaskFolder,
			);

			if (ungroupedItems.length > 0) {
				const emptyBlock: EmptyContainerBlock = {
					kind: "emptyContainer" as const,
					value: null,
					children: ungroupedItems
				}

				return [emptyBlock, ...projectBlocks, ...folderBlocks];
			} else return [...projectBlocks, ...folderBlocks];
		}
	}, [allProjects, view.kind, taskFolders, taskItems])

	const {isDropTarget, ref} = useDroppable({
		type: "noTaskFolder",
		id: "empty",
		accept: "taskItem",
		collisionPriority: 1
	});

	const [draggingNow, setDraggingNow] = useState(false);
	useDragDropMonitor({
		onDragStart(event, manager) {
			setDraggingNow(true);
		},
		onDragEnd(event, manager) {
			setDraggingNow(false);
		}
	});

	return (
		<div className={"flex flex-col gap-8 transition-[padding] duration-100 " + (draggingNow && !blocks.some(p => p.kind === "emptyContainer") ? "pt-16 " : "") + (isDropTarget ? "rounded-md bg-green-500/20" : "")} ref={ref}>
			{blocks.map((block) => (
				<BlockRenderer key={block.value?._id ?? "empty"} block={block} {...props} />
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
} & Omit<ListLayoutProps, "blocks" | "taskItems" | "allProjects" | "taskFolders">) {
	const [editingFolderId, setEditingFolderId] = useState<Id<"taskFolders"> | null>(null);

	return (
		<div>
			{
				block.kind === "project" && (
					<ProjectBlockRenderer
						block={block}
						view={view}

						selectedTaskItem={selectedTaskItem}
						setSelectedTaskItem={setSelectedTaskItem}
						setSelectedViewId={setSelectedViewId}

						taskFolderActions={taskFolderActions}
						taskItemActions={taskItemActions}
					/>
				)
			}
			{
				block.kind === "taskFolder" && (
					<TaskFolderBlockRenderer
						editingFolderId={editingFolderId}
						setEditingFolderId={setEditingFolderId}

						block={block}
						view={view}

						selectedTaskItem={selectedTaskItem}
						setSelectedTaskItem={setSelectedTaskItem}
						setSelectedViewId={setSelectedViewId}

						taskFolderActions={taskFolderActions}
						taskItemActions={taskItemActions}
					/>
				)
			}
			{
				block.kind === "emptyContainer" && (
					<div>
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
				)
			}
			{
				block.kind === "taskItem" && (
					<TaskItemLayout
						taskItem={block.value}
						isSelected={selectedTaskItem === block.value._id}
						showTodayIcon={view.kind !== "systemFilter" || view.id !== "today"}
						thisActions={{
							create: null,
							modify: taskItemActions.modify.bind(null, block.value._id),
							delete: null,
						}}
						selectThis={() => setSelectedTaskItem(block.value._id)}
					/>
				)
			}
		</div>
	)

	return null; // project ignored for now
}

function ProjectBlockRenderer(
	{
		block,
		view,
		selectedTaskItem,
		setSelectedTaskItem,
		setSelectedViewId,

		taskItemActions,
		taskFolderActions,
	}: {
		block: ProjectBlock;
	} & Omit<ListLayoutProps, "blocks" | "taskItems" | "allProjects" | "taskFolders">
) {
	return (
		<div className="select-none rounded-md">
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
	)
}

function TaskFolderBlockRenderer(
	{
		editingFolderId,
		setEditingFolderId,

		block,
		view,
		selectedTaskItem,
		setSelectedTaskItem,
		setSelectedViewId,

		taskItemActions,
		taskFolderActions,
	}: {
		editingFolderId: Id<"taskFolders"> | null;
		setEditingFolderId: (id: Id<"taskFolders"> | null) => void;

		block: TaskFolderBlock;
	} & Omit<ListLayoutProps, "blocks" | "taskItems" | "allProjects" | "taskFolders">
) {
	const folder = block.value as Doc<"taskFolders">;

	const [tempFolderTitle, setTempFolderTitle] = useState("");
	useEffect(() => {
		if (editingFolderId === folder._id) {
			setTempFolderTitle(folder.title);
		}
	}, [editingFolderId]);

	const {isDropTarget, ref} = useDroppable({
		type: "taskFolder",
		id: folder._id,
		accept: "taskItem",
		collisionPriority: 2
	});

	return (
		<div className={"select-none " + (isDropTarget ? "rounded-md bg-green-500/20" : "")} ref={ref}>
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
