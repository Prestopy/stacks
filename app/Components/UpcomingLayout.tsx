import {
	TaskItemBlock,
	TaskItemModifications,
} from "@/app/util/types/types";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ViewId } from "@/app/util/types/baseTypes";
import { Actions } from "@/app/util/types/typeUtilities";
import TaskItemLayout from "@/app/Components/TaskItemLayout";
import { useMemo } from "react";
import { isSameDay, toDateOrUndefined } from "@/app/util/dateUtilities";
import { IconPlus } from "@tabler/icons-react";
import Constants from "@/app/util/constants";
import { format } from "date-fns";

interface UpcomingLayoutProps {
	taskItems: Doc<"taskItems">[];
	allProjects: Doc<"projects">[] | null;

	selectedTaskItem: Id<"taskItems"> | null;
	setSelectedTaskItem: (itemId: Id<"taskItems"> | null) => void;

	taskItemActions: Actions<
		(taskFolderId?: undefined, startDate?: Date | undefined) => void, // FIXME- just needs a what date option
		(taskId: Id<"taskItems">, modifications: TaskItemModifications) => void,
		null
	>;
}

interface DateBlock {
	kind: "date";
	value: Date;
	children: TaskItemBlock[];
}
export default function UpcomingLayout({
	taskItems,
	allProjects,
	selectedTaskItem,
	setSelectedTaskItem,
	taskItemActions,
}: UpcomingLayoutProps) {
	const blocks = useMemo(() => {
		// All item blocks
		const itemBlocks: TaskItemBlock[] = taskItems.map((item) => ({
			kind: "taskItem" as const,
			value: item,
		}));

		const folderBlocks: DateBlock[] = [];

		// The next 12 months TODO
		// The next 14 days including today should be dates
		// Everything else be months

		for (let i = 0; i < 7; i++) {
			const date = new Date();
			date.setDate(date.getDate() + i);
			folderBlocks.push({
				kind: "date",
				value: date,
				children: [],
			});
		}

		for (const folderBlock of folderBlocks) {
			folderBlock.children = itemBlocks.filter(
				(itemBlock) => {
					const itemDate = toDateOrUndefined(itemBlock.value.startDate);
					return itemDate !== undefined && isSameDay(itemDate, folderBlock.value);
				},
			);
		}

		return [...folderBlocks];
	}, [taskItems]);

	return (
		<div className="flex flex-col gap-4">
			{blocks.map((block) => (
				<div key={block.value.toISOString()}>
					<div className="group flex flex-row items-center gap-4 px-3">
						<div className="flex flex-row gap-3 items-baseline">
							<h2 className="text-3xl font-bold font-mono">
								{block.value.getDate().toString().padStart(2, "0")}
							</h2>

							<div className="flex flex-row gap-2 items-center text-slate-400">
								<h2 className="text-xl">{format(block.value, "EEEE")}</h2>
								<button
									className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white duration-100"
									onClick={() => taskItemActions.create(undefined, block.value)}
								>
									<IconPlus size={24} />
								</button>
							</div>
						</div>
					</div>

					<hr className="mt-2 mb-4 border-slate-700" />

					{block.children.map((item) => (
						<TaskItemLayout
							key={item.value._id}
							taskItem={item.value}
							isSelected={selectedTaskItem === item.value._id}
							showTodayIcon={true}
							thisActions={{
								create: null,
								modify: taskItemActions.modify.bind(null, item.value._id),
								delete: null,
							}}
							selectThis={() => setSelectedTaskItem(item.value._id)}
						/>
					))}
				</div>
			))}
		</div>
	);
}
