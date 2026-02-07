import {
	Block,
	FilterView,
	ProjectView,
	TaskFolderModifications,
	TaskItemModifications,
	UniverseView,
} from "@/app/util/types/types";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ViewId } from "@/app/util/types/baseTypes";
import { Actions } from "@/app/util/types/typeUtilities";
import TaskItemLayout from "@/app/Components/TaskItemLayout";

interface UpcomingLayoutProps {
	taskItems: Doc<"taskItems">[];

	view: UniverseView | ProjectView | FilterView;

	selectedTaskItem: Id<"taskItems"> | null;
	setSelectedTaskItem: (itemId: Id<"taskItems"> | null) => void;
	setSelectedViewId: (viewId: ViewId) => void;

	taskItemActions: Actions<
		(taskFolderId?: Id<"taskFolders">) => void, // FIXME- just needs a what date option
		(taskId: Id<"taskItems">, modifications: TaskItemModifications) => void,
		null
	>;
	taskFolderActions: Actions<
		null,
		(id: Id<"taskFolders">, mods: TaskFolderModifications) => void,
		(id: Id<"taskFolders">) => void
	>;
}
export default function UpcomingLayout(props: UpcomingLayoutProps) {
	return (
		<div>
			{props.taskItems.map((item) => (
				<TaskItemLayout
					key={item._id}
					taskItem={item}
					isSelected={props.selectedTaskItem === item._id}
					showTodayIcon={true}
					thisActions={{
						modify: props.taskItemActions.modify.bind(null, item._id),
						delete: null,
					}}
					selectThis={() => props.setSelectedTaskItem(item._id)}
				/>
			))}
		</div>
	);
}
