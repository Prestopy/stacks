import ListLayout from "@/app/Components/ListLayout";
import {
	FilterView, ProjectBlock,
	ProjectModifications,
	ProjectView, TaskFolderBlock,
	TaskFolderModifications, TaskItemBlock,
	TaskItemModifications,
	UniverseModifications,
	UniverseView,
} from "@/app/util/types/types";
import {Doc, Id} from "@/convex/_generated/dataModel";
import RichIcon from "@/app/Components/RichIcon";
import Constants from "@/app/util/constants";
import {
	IconCircleCheckFilled,
	IconDots,
	IconPencil,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useEffect, useMemo, useRef, useState} from "react";
import CalendarInputTag from "@/app/Components/CalendarInputTag";
import { dateToPatch } from "@/app/util/utilities";
import { ViewId } from "@/app/util/types/baseTypes";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ViewDeleteDialogContent from "@/app/Components/ViewDeleteDialogContent";
import UpcomingLayout from "@/app/Components/UpcomingLayout";
import {Actions} from "@/app/util/types/typeUtilities";


interface BaseProps {
	// taskFolders: Doc<"taskFolders">[];
	// taskItems: Doc<"taskItems">[];
	taskItems: Doc<"taskItems">[];
	taskFolders: Doc<"taskFolders">[];
	allProjects: Doc<"projects">[];

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
interface SystemFilterProps {
	view: FilterView;
	kind: FilterView["kind"];

	thisActions?: undefined;
}
interface UniverseProps {
	view: UniverseView;
	kind: UniverseView["kind"];

	thisActions: Actions<
		null,
		(mods: UniverseModifications) => void,
		() => void
	>;
}
interface ProjectProps {
	view: ProjectView;
	kind: ProjectView["kind"];

	thisActions: Actions<
		null,
		(mods: ProjectModifications) => void,
		() => void
	>;

	deadline: Date | undefined;
}

interface MainViewProps extends BaseProps {
	options: SystemFilterProps | UniverseProps | ProjectProps;
}

export default function MainView({
	options,

	taskItems,
	taskFolders,
	allProjects,

	selectedTaskItem,
	setSelectedTaskItem,
	setSelectedViewId,

	taskItemActions,
	taskFolderActions,
}: MainViewProps) {
	const blocks = useMemo(() => {
		// All item blocks
		const itemBlocks: TaskItemBlock[] = taskItems.map((item) => ({
			kind: "taskItem" as const,
			value: item,
		}));

		if (options.kind === "project" || options.kind === "universe") {
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

			return [...ungroupedItems, ...folderBlocks];
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

			return [...ungroupedItems, ...projectBlocks, ...folderBlocks];
		}
	}, [allProjects, options.kind, taskFolders, taskItems])

	return (
		<div
			className="flex-1 flex flex-col items-center px-4 pt-20 overflow-auto bg-slate-900"
			style={{
				scrollbarGutter: "stable"
			}}
			onClick={() => setSelectedTaskItem(null)}
		>
			<div className="w-[720] h-full">
				{/*TITLE BAR*/}
				<TitleBar options={options} />

				{/*PROJECT BAR*/}
				{
					options.kind === "project" && (
						<div className="flex flex-col mt-5">
							<div className="border-y border-y-slate-700 py-1">
								<CalendarInputTag
									placeholder="Deadline..."
									date={options.deadline !== undefined ? {
										kind: "date",
										value: options.deadline
									} : undefined}
									icon={Constants.Icons.DEADLINE}
									updateDate={(newDate) => {
										const { value } = dateToPatch(newDate, {
											allowSomeday: false,
										});
										options.thisActions?.modify({
											deadline: value,
										});
									}}
								/>
							</div>
						</div>
					)
				}

				<hr className="my-5 px-5 border-none" />

				{/*TASK LIST*/}
				<div className="pb-20">
					{options.view.layout === "list" ?
						<ListLayout
							blocks={blocks}

							view={options.view}

							selectedTaskItem={selectedTaskItem}
							setSelectedTaskItem={setSelectedTaskItem}
							setSelectedViewId={setSelectedViewId}

							taskItemActions={taskItemActions}
							taskFolderActions={taskFolderActions}
						/>
						:
						<UpcomingLayout
							taskItems={taskItems}

							view={options.view}

							selectedTaskItem={selectedTaskItem}
							setSelectedTaskItem={setSelectedTaskItem}
							setSelectedViewId={setSelectedViewId}

							taskItemActions={taskItemActions}
							taskFolderActions={taskFolderActions}
						/>
					}
				</div>
			</div>
		</div>
	);
}

type TitleBarProps = Pick<MainViewProps, "options">;

function TitleBar({ options }: TitleBarProps) {
	const [editingTextField, setEditingTextField] = useState<
		"title" | "description" | null
	>(null);

	const [tempTextFields, setTempTextFields] = useState<{
		title: string;
		description: string | undefined;
	}>({
		title: options.view.title,
		description: options.view.description,
	});
	const tempTextFieldsRef = useRef(tempTextFields);
	useEffect(() => {
		tempTextFieldsRef.current = tempTextFields;
	}, [tempTextFields]);

	useEffect(() => {
		setTempTextFields({
			title: options.view.title,
			description: options.view.description,
		});
		setEditingTextField(null);
	}, [options.view.id]);

	useEffect(() => {
		setTempTextFields({
			title: options.view.title,
			description: options.view.description,
		});
	}, [editingTextField]);

	const saveTextFields = () => {
		if (options.kind === "systemFilter") return;
		options.thisActions.modify({
			title: tempTextFieldsRef.current.title,
			description: tempTextFieldsRef.current.description,
		});
	};

	return (
		<div className="select-none">
			<div className="flex flex-row gap-5 items-center w-full">
				{editingTextField !== "title" ?
					<h1
						className="text-4xl font-bold flex items-center gap-2"
						style={{
							color:
								options.view.kind !== "project" ?
									options.view.color
								:	undefined,
						}}
					>
						{
							options.kind === "project" ?
								<button className="group inline-block" onClick={options.thisActions.delete}>
									<div className="block group-hover:hidden">
										<RichIcon
											iconData={
												Constants.DynamicIcons.PROJECT(
													options.view.color,
												)
											}
											size={36}
										/>
									</div>
									<div className="hidden group-hover:block opacity-80">
										<IconCircleCheckFilled size={36} />
									</div>
								</button>
								:
								<span className="inline-block">
									<RichIcon
										iconData={{ name: options.view.iconName }}
										size={36}
									/>
								</span>
						}
						{" "}
						{options.view.title}
					</h1>
				:	<h1 className="flex flex-row gap-2 items-center">
						<span className="inline-block">
							<RichIcon
								iconData={
									options.view.kind === "project" ?
										Constants.DynamicIcons.PROJECT(
											options.view.color,
										)
									:	{ name: options.view.iconName }
								}
								size={36}
							/>
						</span>
						<div className="flex flex-row gap-2">
							<input
								type="text"
								value={tempTextFields.title}
								onChange={(e) => {
									setTempTextFields({
										...tempTextFields,
										title: e.target.value,
									});
								}}
								className="bg-slate-800 text-white text-4xl font-bold rounded-md px-2 py-1 w-full"
								autoFocus
							/>
							<button
								className="flex-1 px-4 text-sm hover:bg-slate-700 bg-slate-800 duration-100 rounded-md"
								onClick={() => {
									saveTextFields();
									setEditingTextField(null);
								}}
							>
								Save
							</button>
						</div>
					</h1>
				}

				{options.kind !== "systemFilter" ?
					<DropdownMenu>
						<DropdownMenuTrigger className="text-slate-400 hover:text-white duration-100">
							<IconDots size={24} />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={() => {
									setEditingTextField("title");
								}}
							>
								<IconPencil />
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() =>
									setEditingTextField("description")
								}
							>
								{(
									!options.view.description ||
									options.view.description.length === 0
								) ?
									<>
										<IconPlus />
										Add description
									</>
								:	<>
										<IconPencil />
										Edit description
									</>
								}
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Dialog>
									<DialogTrigger asChild onClick={(e) => {
										e.stopPropagation();
									}}>
										<span className="flex flex-row items-center gap-2">
											<IconTrash />
											Delete
										</span>
									</DialogTrigger>
									<DialogContent onClick={(e) => {
										e.stopPropagation();
									}}>
										<ViewDeleteDialogContent
											kind={options.view.kind}
											deleteThis={
												options.thisActions.delete
											}
										/>
									</DialogContent>
								</Dialog>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				:	null}
			</div>

			{editingTextField !== "description" ?
				<p className="text-slate-300 cursor-text !select-text">
					{options.view.description
						?.split("\n")
						.map((line, index) => (
							<span key={index}>
								{line}
								<br />
							</span>
						))}
				</p>
			:	<div>
					<textarea
						className="h-16 bg-slate-800 text-white rounded-md px-2 py-1 w-full"
						onChange={(e) => {
							setTempTextFields({
								...tempTextFields,
								description: e.target.value,
							});
						}}
						value={tempTextFields.description}
						autoFocus
					/>
					<div className="flex flex-row">
						<button
							className="px-4 py-2 text-sm hover:bg-slate-700 bg-slate-800 duration-100 rounded-md"
							onClick={() => {
								saveTextFields();
								setEditingTextField(null);
							}}
						>
							Save
						</button>
					</div>
				</div>
			}
		</div>
	);
}
