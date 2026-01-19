import { Doc, Id } from "@/convex/_generated/dataModel";
import {
	BaseTypes,
	FilterViewIds,
	NodeContainerKind,
	NodeKind,
	NodeViewKind,
} from "@/app/util/types/baseTypes";
import { OptionalWithNull } from "@/app/util/types/typeUtilities";

// VIEWS
interface BaseView {
	kind: NodeViewKind;
	id: string;
	layout: BaseTypes;
	title: string;
	iconName: string;
	color: string | undefined;
	description?: string;
}
export interface FilterView extends BaseView {
	kind: "systemFilter";
	id: FilterViewIds;
	layout: "list" | "schedule";
}
export interface UniverseView extends BaseView {
	kind: "universe";
	id: Id<"universes">;
	layout: "list";
}
export interface ProjectView extends BaseView {
	kind: "project";
	id: Id<"projects">;
	layout: "list";
}

// BLOCKS
export type Block = TaskItemBlock | TaskFolderBlock | ProjectBlock;
interface BaseBlock {
	kind: Extract<NodeKind, "taskItem" | "taskFolder" | "project">;
	value: Doc<"taskItems" | "taskFolders" | "projects">;
	children?: Block[];
}
export interface TaskItemBlock extends BaseBlock {
	kind: "taskItem";
	value: Doc<"taskItems">;
	children?: [];
}
export interface TaskFolderBlock extends BaseBlock {
	kind: "taskFolder";
	value: Doc<"taskFolders">;
	children: TaskItemBlock[];
}
export interface ProjectBlock extends BaseBlock {
	kind: "project";
	value: Doc<"projects">;
	children: TaskItemBlock[];
}

// LOCATIONS
export type TaskLocation = TaskFolderLocation | UniverseLocation | ProjectLocation;

interface BaseLocation {
	kind: NodeContainerKind;

	id: string;
	title: string;
	iconName: string;
}
interface TaskFolderLocation extends BaseLocation {
	kind: "taskFolder";
	id: Id<"taskFolders">;
}
interface UniverseLocation extends BaseLocation {
	kind: "universe";
	id: Id<"universes">;
}
interface ProjectLocation extends BaseLocation {
	kind: "project";
	id: Id<"projects">;
}


// MODIFICATIONS
export type TaskItemModifications = Partial<
	OptionalWithNull<Omit<Doc<"taskItems">, "_id" | "_creationTime" | "user">>
>;
export type TaskFolderModifications = Partial<
	OptionalWithNull<Omit<Doc<"taskFolders">, "_id" | "_creationTime" | "user">>
>;
export type UniverseModifications = Partial<
	OptionalWithNull<Omit<Doc<"universes">, "_id" | "_creationTime" | "user">>
>;
export type ProjectModifications = Partial<
	OptionalWithNull<Omit<Doc<"projects">, "_id" | "_creationTime" | "user">>
>;
