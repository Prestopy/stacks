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
import { useMemo, useState } from "react";
import RichIcon from "@/app/Components/RichIcon";
import Constants from "@/app/util/constants";
import { ViewId } from "@/app/util/types/baseTypes";
import { Actions } from "@/app/util/types/typeUtilities";
import { useDragDropMonitor, useDroppable } from "@dnd-kit/react";
import { createDropId } from "@/app/util/dragndrop";
import { useUniversalState } from "../UseUniversalManager";

interface ListLayoutProps {
	taskItemsForView: Doc<"taskItems">[];
	taskFoldersForView: Doc<"taskFolders">[];

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
	const { taskItemsForView, taskFoldersForView } = props;
	const U = useUniversalState();

	const blocks = useMemo(() => {
		// All item blocks
		const itemBlocks: TaskItemBlock[] = taskItemsForView.map((item) => ({
			kind: "taskItem" as const,
			value: item,
		}));

		const viewKind = U.getView(U.selectedViewId)?.kind;
		if (viewKind === "project" || viewKind === "universe") {
			const folderBlocks: TaskFolderBlock[] = taskFoldersForView.map((folder) => ({
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
			const folderBlocks: TaskFolderBlock[] = taskFoldersForView.map((folder) => ({
				kind: "taskFolder" as const,
				value: folder,
				children: itemBlocks.filter(
					(itemBlock) =>
						itemBlock.value.parentTaskFolder?.toString() === folder._id.toString(),
				),
			}));

			// Project blocks only for projects that have items in the current view
			const projectBlocks: ProjectBlock[] = (U.allProjects ?? [])
				.map((project) => ({
					kind: "project" as const,
					value: project,
					children: itemBlocks.filter(
						(itemBlock) =>
							itemBlock.value.parentProject?.toString() === project._id.toString(),
					),
				}))
				.filter((pb) => pb.children.length > 0);

			// items not in projects
			const ungroupedItems = itemBlocks.filter(
				(itemBlock) => !itemBlock.value.parentProject,
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
	}, [U, taskFoldersForView, taskItemsForView])

	const {isDropTarget, ref} = useDroppable({
		id: createDropId("empty", "noTaskFolder", "mainView"),
		accept: "taskItem",
		collisionPriority: 1
	});

	const [draggingNow, setDraggingNow] = useState(false);
	useDragDropMonitor({
		onDragStart() {
			setDraggingNow(true);
		},
		onDragEnd() {
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

	hideParent,
	taskItemActions,
	taskFolderActions,
}: {
	block: Block;
	hideParent?: boolean;
} & Omit<ListLayoutProps, "blocks" | "taskItemsForView" | "allProjects" | "taskFoldersForView">) {
	const U = useUniversalState();
	const [editingFolderId, setEditingFolderId] = useState<Id<"taskFolders"> | null>(null);

	return (
		<div>
			{
				block.kind === "project" && (
					<ProjectBlockRenderer
						block={block}

						hideParent
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
						isSelected={U.selectedTaskItemId === block.value._id}
						showParent={!hideParent && U.getView(U.selectedViewId)?.kind === "systemFilter"}
						showTodayIcon={U.getView(U.selectedViewId)?.kind !== "systemFilter" || U.getView(U.selectedViewId)?.id !== "today"}
						thisActions={{
							create: null,
							modify: taskItemActions.modify.bind(null, block.value._id),
							delete: null,
						}}
						selectThis={() => U.navigateToTaskItem(block.value._id)}
					/>
				)
			}
		</div>
	)
}

function ProjectBlockRenderer(
	{
		block,

		hideParent,
		taskItemActions,
		taskFolderActions,
	}: {
		block: ProjectBlock;
		hideParent?: boolean;
	} & Omit<ListLayoutProps, "blocks" | "taskItemsForView" | "allProjects" | "taskFoldersForView">
) {
	const U = useUniversalState();
	const project = block.value as Doc<"projects">;

	const {isDropTarget, ref} = useDroppable({
		id: createDropId(project._id, "project", "mainView"),
		accept: "taskItem",
		collisionPriority: 2
	});

	return (
		<div ref={ref} className={"select-none rounded-md " + (isDropTarget ? "bg-green-500/20" : "")}>
			<div className="flex flex-row items-center gap-4 px-3">
				<RichIcon iconData={Constants.DynamicIcons.PROJECT(project.color)} size={24} />

				<div className="flex flex-row gap-1 items-center">
					<h2 className="text-xl font-bold flex items-center gap-2">
						<span className="font-normal">
							<span
								className="hover:underline underline-offset-3 text-slate-400 cursor-pointer"
								onClick={() => U.navigateToView(project.parentUniverse)}
							>{U.getUniverse(project.parentUniverse)?.title}</span>
						</span>
						<span className="text-slate-400 font-normal">/</span>
						<div className="group inline-flex items-center justify-center gap-2 cursor-pointer">
							<span className="group-hover:underline underline-offset-3" onClick={() => U.navigateToView(project._id)}>
								{project.title}
							</span>
								<span className="inline-block opacity-0 group-hover:opacity-100 duration-100">
								<IconChevronRight size={24} />
							</span>
						</div>
					</h2>
				</div>
			</div>

			<hr className="mt-2 mb-4 border-slate-700" />

			{block.children.map((child) => (
				<BlockRenderer
					key={child.value._id}
					block={child}

					hideParent={hideParent}
					taskFolderActions={taskFolderActions}
					taskItemActions={taskItemActions}
				/>
			))}
		</div>
	);
}

function TaskFolderBlockRenderer(
	{
		editingFolderId,
		setEditingFolderId,

		block,

		taskItemActions,
		taskFolderActions,
	}: {
		editingFolderId: Id<"taskFolders"> | null;
		setEditingFolderId: (id: Id<"taskFolders"> | null) => void;

		block: TaskFolderBlock;
	} & Omit<ListLayoutProps, "blocks" | "taskItemsForView" | "allProjects" | "taskFoldersForView">
) {
	// FIXME: You can edit multiple folders anyways because BlockRenderer is rendered individually for each task folder
	// so passing it as a prop does absolutely nothing.
	const folder = block.value as Doc<"taskFolders">;

	const [tempFolderTitle, setTempFolderTitle] = useState("");
	// useEffect(() => {
	// 	if (editingFolderId === folder._id) {
	// 		setTempFolderTitle(folder.title);
	// 	}
	// }, [editingFolderId]);

	const {isDropTarget, ref} = useDroppable({
		id: createDropId(folder._id, "taskFolder", "mainView"),
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
					taskFolderActions={taskFolderActions}
					taskItemActions={taskItemActions}
				/>
			))}
		</div>
	);
}
