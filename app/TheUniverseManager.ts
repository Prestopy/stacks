import { Doc, Id } from "@/convex/_generated/dataModel";
import { createContext } from "react";
import { TaskView, ViewId } from "@/app/util/types/baseTypes";
import Constants from "@/app/util/constants";

export interface UniversalValues {
	allTaskItems:   Doc<"taskItems">[];
	allTaskFolders: Doc<"taskFolders">[];
	allProjects:    Doc<"projects">[];
	allUniverses:   Doc<"universes">[];

	getView:       (viewId: ViewId)              => TaskView           | null;
	getTaskItem:   (itemId: Id<"taskItems">)     => Doc<"taskItems">   | null;
	getTaskfolder: (folderId: Id<"taskFolders">) => Doc<"taskFolders"> | null;
	getProject:    (projectId: Id<"projects">)   => Doc<"projects">    | null;
	getUniverse:   (universeId: Id<"universes">) => Doc<"universes">   | null;

	selectedTaskItemId: Id<"taskItems"> | null;
	navigateToTaskItem: (itemId: Id<"taskItems"> | null) => void;

	selectedViewId: ViewId;
	navigateToView: (viewId: ViewId) => void;
}

export const UniversalContext = createContext<UniversalValues>({
	allTaskItems: [],
	allTaskFolders: [],
	allProjects: [],
	allUniverses: [],

	getView: (viewId: ViewId) => null,
	getTaskItem: (itemId: Id<"taskItems">) => null,
	getTaskfolder: (folderId: Id<"taskFolders">) => null,
	getProject: (projectId: Id<"projects">) => null,
	getUniverse: (universeId: Id<"universes">) => null,

	selectedTaskItemId: null,
	navigateToTaskItem: (itemId: Id<"taskItems"> | null) => {},

	selectedViewId: Constants.FilterViews.INBOX.id,
	navigateToView: (viewId: ViewId) => {},
})
