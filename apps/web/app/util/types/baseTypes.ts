import { Id } from "@/convex/_generated/dataModel";
import { FilterView, ProjectView, UniverseView } from "@/app/util/types/types";

// KINDS
export type NodeKind = "taskItem" | "taskFolder" | "project" | "universe" | "systemFilter";
export type NodeViewKind = Extract<NodeKind, "project" | "universe" | "systemFilter">;
export type NodeContainerKind = Extract<NodeKind, "taskFolder" | "project" | "universe">;
export type NodeViewContainerKind = NodeViewKind & NodeContainerKind;

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
