import { Doc, Id } from "@/convex/_generated/dataModel";
import Constants from "@/app/util/constants";

export interface IconData {
	name: string;
	color?: string;
}
export type DateOrSomeday = { kind: "date"; value: Date } | { kind: "someday" };

export type ViewId = FilterViewIds | Id<"universes"> | Id<"projects">;
export type TaskView = FilterView | UniverseView | ProjectView;

export type FilterViewIds =
	| "inbox"
	| "today"
	| "everything"
	| "flagged"
	| "someday"
	| "schedule"
	| "completed";

export type ViewType = "system_filter" | "universe" | "project";
interface BaseView {
	id: string;

	title: string;
	iconName: string;
	color: string | undefined;
	description?: string;
}
export interface FilterView extends BaseView {
	kind: "system_filter";
	layout: "list" | "schedule";
	id: FilterViewIds;
}
export interface UniverseView extends BaseView {
	kind: "universe";
	layout: "list";
	id: Id<"universes">;
}
export interface ProjectView extends BaseView {
	kind: "project";
	layout: "list";
	id: Id<"projects">;
}

interface BaseLocation {
	_id: string;
	title: string;
	iconName: string;
}
interface TaskFolderLocation extends BaseLocation {
	kind: "folder";
	_id: Id<"taskFolders">;
}
interface UniverseLocation extends BaseLocation {
	kind: "universe";
	_id: Id<"universes">;
}
interface ProjectLocation extends BaseLocation {
	kind: "project";
	_id: Id<"projects">;
}
export type TaskLocation = TaskFolderLocation | UniverseLocation | ProjectLocation;


type OptionalWithNull<T> = {
	[K in keyof T]: undefined extends T[K] ?
		Exclude<T[K], undefined> | null | undefined
	:	T[K];
};
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

export function getViewFromId(
	id: ViewId,
	universes: Doc<"universes">[],
	projects: Doc<"projects">[],
): TaskView | null {
	const universe = universes.find((u) => u._id.toString() === id.toString());
	if (universe) {
		return toUniverseView(universe);
	}

	const project = projects.find((p) => p._id.toString() === id.toString());
	if (project) {
		return toProjectView(project);
	}

	for (const [_, value] of Object.entries(Constants.FilterViews)) {
		if (id === value.id) return value;
	}

	return null;
}

export function toUniverseView(doc: Doc<"universes">): UniverseView {
	return {
		kind: "universe",
		id: doc._id,
		title: doc.title,
		iconName: doc.iconName ?? "",
		color: doc.color ?? Constants.Colors.DEFAULT,
		description: doc.description,

		layout: "list",
	};
}
export function toProjectView(doc: Doc<"projects">): ProjectView {
	return {
		kind: "project",
		id: doc._id,
		title: doc.title,
		iconName: "IconCircle",
		color: doc.color ?? Constants.Colors.DEFAULT,
		description: doc.description,

		layout: "list",
	};
}
