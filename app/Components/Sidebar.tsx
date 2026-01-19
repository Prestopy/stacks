import {
	FilterView,
	ProjectView,
	TaskView,
	UniverseView,
	ViewId,
} from "@/app/util/types";
import RichIcon from "@/app/Components/RichIcon";
import { Id } from "@/convex/_generated/dataModel";
import {
	Dialog, DialogClose,
	DialogContent,
	DialogDescription, DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface SidebarButtonProps {
	view: TaskView;
	isChild?: boolean;
	isSelected: boolean;

	setSelectedViewId: (view: ViewId) => void;

	modificationOptions:
		| {
				disallowModifications: true;
		  }
		| {
				disallowModifications: false;
				createChildItem?: (projectTitle?: string) => void;
				deleteThis: () => void;
		  };
}
function SidebarButton({
	view,
	isChild,
	isSelected,
	setSelectedViewId,
	modificationOptions,
}: SidebarButtonProps) {
	const [projectTitle, setProjectTitle] = useState("");

	const handleCancel = () => {
		setProjectTitle("");
	}

	return (
		<button
			className={`group flex flex-row justify-between items-center px-4 py-1 w-full ${
				!isChild ? "font-bold text-slate-300"
				: !isSelected ? "text-slate-400"
				: "text-slate-300"
			} text-left ${isSelected ? "bg-white/5" : ""} hover:bg-white/5 duration-100 rounded-lg flex items-center gap-2`}
			onClick={() => setSelectedViewId(view.id)}
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
			{!modificationOptions.disallowModifications && (
				<div
					className="flex flex-row gap-1 text-slate-400 opacity-0 group-hover:opacity-100 duration-100"
					onClick={(e) => e.stopPropagation()}
				>
					<Dialog>
						<DialogTrigger asChild>
							{/*<button>*/}
								<IconTrash size={16} />
							{/*</button>*/}
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Are you absolutely sure?</DialogTitle>
								<DialogDescription>
									This action cannot be undone. This will permanently delete this {view.kind === "universe" ? "universe and all its projects and tasks" : "project and all of its tasks"}.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">
										Cancel
									</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button
										onClick={() => {
											modificationOptions.deleteThis();
										}}
										variant="destructive"
									>
										Delete
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					{modificationOptions.createChildItem && (
						<Dialog>
							<DialogTrigger asChild>
								{/*<button>*/}
									<IconPlus size={16} />
								{/*</button>*/}
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
										<Button
											variant="outline"
											onClick={handleCancel}
										>
											Cancel
										</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button onClick={() => {
											if (modificationOptions.createChildItem)
												modificationOptions.createChildItem(projectTitle);

											console.log(projectTitle)
										}}>
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
	blocks: Section[];
	selectedView: TaskView | null;
	setSelectedViewId: (view: ViewId) => void;

	modificationOptions:
		| {
				disallowModifications: true;
		  }
		| {
				disallowModifications: false;
				createProject: (universeId: Id<"universes">, projectTitle?: string) => void;
				deleteUniverse: (universeId: Id<"universes">) => void;
				deleteProject: (projectId: Id<"projects">) => void;
		  };
}
function BlockList({
	blocks,
	selectedView,
	setSelectedViewId,
	modificationOptions,
}: BlockListProps) {
	return blocks.map((universeOrFilterBlock, i) => {
		if (universeOrFilterBlock.kind === "divider") {
			return <hr key={i} className="my-3 border-slate-700" />;
		} else if (universeOrFilterBlock.kind === "spacer") {
			return <hr key={i} className="my-3 border-none" />;
		}

		return (
			<div key={i}>
				<SidebarButton
					view={universeOrFilterBlock.view}
					isSelected={
						selectedView?.id === universeOrFilterBlock.view.id
					}
					setSelectedViewId={setSelectedViewId}
					modificationOptions={
						modificationOptions.disallowModifications ?
							modificationOptions
						:	{
								disallowModifications: false,
								createChildItem: (projectTitle?: string) => {
									if (
										universeOrFilterBlock.view.kind ===
										"universe"
									)
										modificationOptions.createProject(
											universeOrFilterBlock.view.id,
											projectTitle,
										);
								},
								deleteThis: () => {
									if (
										universeOrFilterBlock.view.kind ===
										"universe"
									)
										modificationOptions.deleteUniverse(
											universeOrFilterBlock.view.id,
										);
								},
							}
					}
				/>
				{universeOrFilterBlock.childData && (
					<>
						{universeOrFilterBlock.childData?.map(
							(projectBlock, j) => (
								<SidebarButton
									key={j}
									isChild
									view={projectBlock.view}
									isSelected={
										selectedView?.id ===
										projectBlock.view.id
									}
									setSelectedViewId={setSelectedViewId}
									modificationOptions={
										(
											modificationOptions.disallowModifications
										) ?
											modificationOptions
										:	{
												disallowModifications: false,
												deleteThis: () => {
													modificationOptions.deleteProject(
														projectBlock.view.id,
													);
												},
											}
									}
								/>
							),
						)}
					</>
				)}
			</div>
		);
	});
}

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
	systemBlocks: Section[];
	userBlocks: Section[];

	selectedView: TaskView | null;
	setSelectedViewId: (view: ViewId) => void;

	createUniverse: (title?: string, desc?: string) => void;
	createProject: (universeId: Id<"universes">, title?: string, desc?: string) => void;

	deleteUniverse: (universeId: Id<"universes">) => void;
	deleteProject: (projectId: Id<"projects">) => void;
}
export default function Sidebar({
	systemBlocks,
	userBlocks,
	selectedView,
	setSelectedViewId,
	createUniverse,
	createProject,
	deleteUniverse,
	deleteProject,
}: SidebarProps) {
	// Create state for universe name input
	const [universeTitle, setUniverseTitle] = useState("");

	const handleCancel = () => {
		setUniverseTitle("");
	}

	const userBlocksWithSpacing = [...userBlocks];
	for (let i = userBlocksWithSpacing.length - 1; i >= 0; i--) {
		if (userBlocksWithSpacing[i].kind === "data") {
			if (i !== userBlocksWithSpacing.length - 1) {
				userBlocksWithSpacing.splice(i + 1, 0, { kind: "spacer" });
			}
		}
	}

	return (
		<div className="relative w-96 h-screen pt-8 bg-slate-800 border-r border-r-slate-700 select-none">
			<div className="p-4">
				<BlockList
					blocks={systemBlocks}
					selectedView={selectedView}
					setSelectedViewId={setSelectedViewId}
					modificationOptions={{
						disallowModifications: true,
					}}
				/>

				<div className="relative flex flex-row justify-between items-center group">
					<div className="w-full">
						<hr className="my-3 border-slate-700" />
					</div>
				</div>

				<BlockList
					blocks={userBlocksWithSpacing}
					selectedView={selectedView}
					setSelectedViewId={setSelectedViewId}
					modificationOptions={{
						disallowModifications: false,
						createProject: createProject,
						deleteUniverse: deleteUniverse,
						deleteProject: deleteProject,
					}}
				/>
			</div>

			<div className="absolute bottom-0 w-full h-12 px-4 bg-slate-800 border-t border-slate-700 flex flex-row justify-between items-center gap-10">
				<Dialog>
					<DialogTrigger asChild>
						<button
							className="flex flex-row gap-2 items-center text-sm text-slate-400 hover:text-white duration-100 right-0"
						>
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
								<Button
									variant="outline"
									onClick={handleCancel}
								>
									Cancel
								</Button>
							</DialogClose>
							<DialogClose asChild>
								<Button onClick={() => createUniverse(universeTitle)}>
									Create universe
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
