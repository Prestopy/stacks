import { Doc } from "@/convex/_generated/dataModel";
import Constants from "@/app/util/constants";
import { TaskView, ViewId } from "@/app/util/types/baseTypes";
import { ProjectView, UniverseView } from "@/app/util/types/types";

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
