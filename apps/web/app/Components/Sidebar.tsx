import { FilterView, ProjectView, UniverseView } from "@/app/util/types/types";
import RichIcon from "@/app/Components/RichIcon";
import { Id } from "@/convex/_generated/dataModel";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconPlus, IconTrash} from "@tabler/icons-react";
import { TaskView, ViewId } from "@/app/util/types/baseTypes";
import { Actions } from "@/app/util/types/typeUtilities";
import ViewDeleteDialogContent from "@/app/Components/ViewDeleteDialogContent";
import { useDroppable } from "@dnd-kit/react";
import { createDropId } from "@/app/util/dragndrop";
import { useUniversalState } from "@/app/UseUniversalManager";
import {ResizableHandle, ResizablePanel} from "@/components/ui/resizable";

type Section = Divider | Spacer | Data;

interface Divider {
	kind: "divider";
}

interface Spacer {
	kind: "spacer";
}

interface BaseData {
	kind: "data";
	view: TaskView;
	childData?: BaseData[];
}

interface Data extends BaseData {
	kind: "data";
	view: UniverseView | FilterView;
	childData?: ChildData[];
}

interface ChildData extends BaseData {
	kind: "data";
	view: ProjectView;
	deadline?: Date;
	childData?: undefined;
}

interface SidebarProps {
	systemSections: Section[];
	userSections: Section[];

	hideSidebar: () => void;
	hideSidebarOnSelect: boolean;

	universeActions: Actions<
		(title?: string, desc?: string) => void,
		null,
		(universeId: Id<"universes">) => void
	>;
	projectActions: Actions<
		(universeId: Id<"universes">, title?: string, desc?: string) => void,
		null,
		(projectId: Id<"projects">) => void
	>;
}

export default function Sidebar({
	systemSections,
	userSections,

	hideSidebar,
    hideSidebarOnSelect,

	universeActions,
	projectActions,
}: SidebarProps) {
	// Create state for universe name input
	const [universeTitle, setUniverseTitle] = useState("");

	const handleCancel = () => {
		setUniverseTitle("");
	};

	const userSectionsWithSpacing = [...userSections];
	for (let i = userSectionsWithSpacing.length - 1; i >= 0; i--) {
		if (userSectionsWithSpacing[i].kind === "data") {
			if (i !== userSectionsWithSpacing.length - 1) {
				userSectionsWithSpacing.splice(i + 1, 0, { kind: "spacer" });
			}
		}
	}

	return (
		<div className="flex flex-row gap-0 w-full">
			<div className="relative w-full h-screen bg-slate-800 border-r border-r-slate-700 select-none">
				<div className="overflow-auto h-full" style={{ scrollbarGutter: "stable" }}>
					<div className="flex items-center justify-between">
						{/*HEAD*/}
						<div></div>
						<button
							className="p-1 m-1 text-slate-400 hover:bg-slate-700 rounded transition-colors duration-200"
							onClick={hideSidebar}
						>
							<IconLayoutSidebarLeftCollapse />
						</button>
					</div>

					<div className="p-4">
						<SectionList
							sections={systemSections}
							onButtonClick={hideSidebarOnSelect ? hideSidebar : () => {}}
						/>

						<div className="relative flex flex-row justify-between items-center group">
							<div className="w-full">
								<hr className="my-3 border-slate-700" />
							</div>
						</div>

						<SectionList
							sections={userSectionsWithSpacing}
							onButtonClick={hideSidebarOnSelect ? hideSidebar : () => {}}
							universeActions={{
								create: null,
								modify: null,
								delete: universeActions.delete,
							}}
							projectActions={projectActions}
						/>
					</div>
				</div>

				<div className="absolute bottom-0 w-full h-12 px-4 bg-slate-800 border-t border-slate-700 flex flex-row justify-between items-center gap-10">
					<Dialog>
						<DialogTrigger asChild>
							<button className="flex flex-row gap-2 items-center text-sm text-slate-400 hover:text-white duration-100 right-0">
								<IconPlus size={18} />
								<p>New universe</p>
							</button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create a universe</DialogTitle>
								<DialogDescription>
									Create a universe to organize your tasks in.
								</DialogDescription>
							</DialogHeader>

							<Label>Title</Label>
							<Input
								onChange={(e) => {
									setUniverseTitle(e.target.value);
								}}
								id="title-1"
								name="title"
								placeholder="Personal, Work, etc."
							/>

							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline" onClick={handleCancel}>
										Cancel
									</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button onClick={() => universeActions.create(universeTitle)}>
										Create universe
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}

interface SidebarButtonProps {
	view: TaskView;
	isChild?: boolean;
	isSelected: boolean;

	onClick: () => void,

	createChildItem?: (projectTitle?: string) => void;
	deleteThis?: () => void;
}

function SidebarButton({
	view,
	isChild,
	isSelected,
	onClick,
	createChildItem,
	deleteThis,
}: SidebarButtonProps) {
	const U = useUniversalState();

	const [projectTitle, setProjectTitle] = useState("");

	const handleCancel = () => {
		setProjectTitle("");
	};

	const { isDropTarget, ref } = useDroppable({
		id: createDropId(view.id, view.kind, "sidebar"),
		accept: "taskItem",
		disabled: view.kind === "systemFilter",
	});

	return (
		<button
			ref={ref}
			className={
				`group flex flex-row justify-between items-center px-4 py-2 md:py-1 w-full ${
					!isChild ? "font-bold text-slate-300"
					: !isSelected ? "text-slate-400"
					: "text-slate-300"
				} text-left ${isSelected ? "bg-white/5" : ""} hover:bg-white/5 duration-100 rounded-lg flex items-center gap-2 ` +
				(isDropTarget ? "!bg-green-500/20" : "")
			}
			onClick={() => {
				U.navigateToView(view.id);
				onClick();
			}}
		>
			<div className="flex flex-row items-center gap-2 leading-tight">
				<span className="inline-block">
					<RichIcon
						iconData={{
							name: view.iconName,
							color: view.color,
						}}
						size={18}
					/>
				</span>{" "}
				{view.title}
			</div>

			{(deleteThis || createChildItem) && view.kind !== "systemFilter" && (
				<div
					className="flex flex-row gap-1 opacity-0 group-hover:opacity-100 duration-100"
					onClick={(e) => e.stopPropagation()}
				>
					{deleteThis && (
						<Dialog>
							<DialogTrigger asChild>
								<span className="text-slate-400 hover:text-red-500 duration-100">
									<IconTrash size={16} />
								</span>
							</DialogTrigger>
							<DialogContent>
								<ViewDeleteDialogContent kind={view.kind} deleteThis={deleteThis} />
							</DialogContent>
						</Dialog>
					)}

					{createChildItem && (
						<Dialog>
							<DialogTrigger asChild>
								<span className="text-slate-400 hover:text-white duration-100">
									<IconPlus size={16} />
								</span>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create a project</DialogTitle>
									<DialogDescription>
										Create a project to organize your tasks in.
									</DialogDescription>
								</DialogHeader>

								<Label>Title</Label>
								<Input
									onChange={(e) => {
										setProjectTitle(e.target.value);
									}}
									id="title-1"
									name="title"
									placeholder="Finish report, Plan trip, etc."
								/>

								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline" onClick={handleCancel}>
											Cancel
										</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button
											onClick={() => {
												if (createChildItem) createChildItem(projectTitle);
											}}
										>
											Create project
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					)}
				</div>
			)}
		</button>
	);
}

interface BlockListProps {
	sections: Section[];

	onButtonClick: () => void,

	projectActions?: Actions<
		(universeId: Id<"universes">, title?: string, desc?: string) => void,
		null,
		(projectId: Id<"projects">) => void
	>;
	universeActions?: Actions<null, null, (universeId: Id<"universes">) => void>;
}

function SectionList({
	sections,
	onButtonClick,
	projectActions,
	universeActions,
}: BlockListProps) {
	const U = useUniversalState();

	return sections.map((universeOrFilterBlock, i) => {
		if (universeOrFilterBlock.kind === "divider") {
			return <hr key={i} className="my-3 border-slate-700" />;
		} else if (universeOrFilterBlock.kind === "spacer") {
			return <hr key={i} className="my-3 border-none" />;
		}

		return (
			<div key={i}>
				<SidebarButton
					view={universeOrFilterBlock.view}
					isSelected={U.selectedViewId === universeOrFilterBlock.view.id}

					onClick={onButtonClick}

					createChildItem={
						projectActions ?
							(projectTitle?: string) => {
								if (universeOrFilterBlock.view.kind === "universe")
									projectActions.create(
										universeOrFilterBlock.view.id,
										projectTitle,
									);
							}
						:	undefined
					}
					deleteThis={
						universeActions ?
							() => {
								if (universeOrFilterBlock.view.kind === "universe")
									universeActions.delete(universeOrFilterBlock.view.id);
							}
						:	undefined
					}
				/>
				{universeOrFilterBlock.childData && (
					<>
						{universeOrFilterBlock.childData?.map((projectBlock, j) => (
							<SidebarButton
								key={j}
								isChild
								view={projectBlock.view}
								isSelected={U.selectedViewId === projectBlock.view.id}

								onClick={onButtonClick}

								deleteThis={
									projectActions ?
										() => {
											projectActions.delete(projectBlock.view.id);
										}
									:	undefined
								}
							/>
						))}
					</>
				)}
			</div>
		);
	});
}
