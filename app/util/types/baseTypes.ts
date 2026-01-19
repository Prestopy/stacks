import { Id } from "@/convex/_generated/dataModel";
import { FilterView, ProjectView, UniverseView } from "@/app/util/types/types";

// KINDS
export type NodeKind = "taskItem" | "taskFolder" | "project" | "universe" | "systemFilter";
export type NodeViewKind = Exclude<NodeKind, "taskItem" | "taskFolder">; // task items and folders are not views
export type NodeContainerKind = Exclude<NodeKind, "taskItem" | "systemFilter">; // system filters and task items are not containers

// VIEWS
export type FilterViewIds =
	| "inbox"
	| "today"
	| "everything"
	| "flagged"
	| "someday"
	| "schedule"
	| "completed";
export type ViewId = FilterViewIds | Id<"universes"> | Id<"projects">;
export type TaskView = FilterView | UniverseView | ProjectView;
export type BaseTypes = "list" | "schedule";

// SPECIFIC DATA STRUCTURES
export interface IconData {
	name: string;
	color?: string;
}

export type DateOrSomeday =
	| {
			kind: "date";
			value: Date;
	  }
	| { kind: "someday" };
