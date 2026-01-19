import ListLayout from "@/app/Components/ListLayout";
import {
	Block,
	FilterView,
	ProjectModifications,
	ProjectView,
	TaskFolderModifications,
	TaskItemModifications,
	UniverseModifications,
	UniverseView,
} from "@/app/util/types/types";
import { Doc, Id } from "@/convex/_generated/dataModel";
import RichIcon from "@/app/Components/RichIcon";
import Constants from "@/app/util/constants";
import {
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
import { useEffect, useRef, useState } from "react";
import CalendarInputTag from "@/app/Components/CalendarInputTag";
import { dateToPatch } from "@/app/util/utilities";
import { ViewId } from "@/app/util/types/baseTypes";


interface BaseProps {
	// taskFolders: Doc<"taskFolders">[];
	// taskItems: Doc<"taskItems">[];
	blocks: Block[];
	selectedTaskItem: Id<"taskItems"> | null;

	setSelectedTaskItem: (itemId: Id<"taskItems"> | null) => void;
	setSelectedViewId: (viewId: ViewId) => void;
	modifyTaskItem: (
		taskId: Id<"taskItems">,
		modifications: TaskItemModifications,
	) => void;

	modifyTaskFolder: (
		id: Id<"taskFolders">,
		mods: TaskFolderModifications,
	) => void;
	deleteTaskFolder: (id: Id<"taskFolders">) => void;
}

interface SystemFilterProps {
	view: FilterView;
	kind: FilterView["kind"];
	modifyThis?: undefined;
	deleteThis?: undefined;
}
interface UniverseProps {
	view: UniverseView;
	kind: UniverseView["kind"];
	modifyThis: (mods: UniverseModifications) => void;
	deleteThis: () => void;
}
interface ProjectProps {
	view: ProjectView;
	kind: ProjectView["kind"];
	modifyThis: (mods: ProjectModifications) => void;
	deleteThis: () => void;

	deadline: Date | undefined;
}

interface MainViewProps extends BaseProps {
	options: SystemFilterProps | UniverseProps | ProjectProps;
}

export default function MainView({
	options,

	blocks,

	selectedTaskItem,
	setSelectedTaskItem,
	setSelectedViewId,
	modifyTaskItem,

	modifyTaskFolder,
	deleteTaskFolder,
}: MainViewProps) {
	return (
		<div
			className="flex-1 flex flex-col items-center px-4 pt-20 overflow-auto bg-slate-900"
			style={{
				scrollbarGutter: "stable"
			}}
			onClick={() => setSelectedTaskItem(null)}
		>
			<div className="w-[720] h-full">
				<TitleBar options={options} />

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
										options.modifyThis({
											deadline: value,
										});
									}}
								/>
							</div>
						</div>
					)
				}

				<hr className="my-5 px-5 border-none" />
				<div className="pb-20">
					{options.view.layout === "list" ?
						<ListLayout
							isFilterLayout={options.view.kind === "systemFilter"}

							blocks={blocks}

							selectedTaskItem={selectedTaskItem}
							setSelectedTaskItem={setSelectedTaskItem}
							setSelectedViewId={setSelectedViewId}
							modifyTaskItem={modifyTaskItem}
							modifyTaskFolder={modifyTaskFolder}
							deleteTaskFolder={deleteTaskFolder}
						/>
						:	<div>Schedule View (to be implemented)</div>}
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
		options.modifyThis({
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
						</span>{" "}
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

				{options.view.kind !== "systemFilter" ?
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
							<DropdownMenuItem onClick={options.deleteThis}>
								<IconTrash />
								Delete
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
