import { TaskItemBlock, TaskItemModifications } from "@/app/util/types/types";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Actions } from "@/app/util/types/typeUtilities";
import TaskItemLayout from "@/app/Components/TaskItemLayout";
import { useMemo } from "react";
import {
	isSameDay,
	isToday,
	toDate,
	toDateOrUndefined,
	today,
	toExactDate,
} from "@/app/util/dateUtilities";
import { IconPlus } from "@tabler/icons-react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import RichIcon from "@/app/Components/RichIcon";
import Constants from "@/app/util/constants";
import { useDroppable } from "@dnd-kit/react";
import { createDropId } from "@/app/util/dragndrop";

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
	value: {
		date: Date;
	};
	children: (TaskItemBlock | DeadlineBlock)[];
}

interface DeadlineBlock {
	kind: "deadline";
	value: {
		_id: Id<"taskItems">;
		title: string;
		isCompleted: boolean;
		date: Date;
	};
}

export default function UpcomingLayout({
	taskItems,
	allProjects,
	selectedTaskItem,
	setSelectedTaskItem,
	taskItemActions,
}: UpcomingLayoutProps) {
	const blocks = useMemo(() => {
		const folderBlocks: DateBlock[] = [];


		for (let i = 0; i < 7; i++) {
			const date = new Date();
			date.setDate(date.getDate() + i);
			folderBlocks.push({
				kind: "date",
				value: { date },
				children: [],
			});
		}

		for (const folderBlock of folderBlocks) {
			folderBlock.children = taskItems
				.filter((i) => i.startDate !== undefined || i.deadline !== undefined)
				.map((item) => {
					const itemDate = toDateOrUndefined(item.startDate);
					const itemDeadline = toDateOrUndefined(item.deadline);
					if (itemDate !== undefined && !item.isCompleted) {
						// FIXME: If the start date == deadline, only start date will show
						if (isSameDay(itemDate, folderBlock.value.date)) {
							return {
								kind: "taskItem",
								value: item,
							} as TaskItemBlock;
						}
					}

					if (itemDeadline !== undefined) {
						if (isSameDay(itemDeadline, folderBlock.value.date)) {
							return {
								kind: "deadline",
								value: {
									_id: item._id,
									title: item.title,
									isCompleted: item.isCompleted,
									date: toDate(itemDeadline),
								},
							} as DeadlineBlock;
						}
					}

					return null;
				})
				.filter((i) => i !== null);
		}

		return [...folderBlocks];
	}, [taskItems]);

	const extraBlock = useMemo(() => {
		if (
			taskItems.some(
				(i) =>
					(i.startDate !== undefined &&
						differenceInCalendarDays(toDate(i.startDate), today()) >= 7) ||
					(i.deadline !== undefined &&
						differenceInCalendarDays(toDate(i.deadline), today()) >= 7),
			)
		) {
			const children: (TaskItemBlock | DeadlineBlock)[] = [];
			for (const item of taskItems) {
				if (item.startDate === undefined && item.deadline === undefined) continue;
				if (
					item.startDate !== undefined &&
					differenceInCalendarDays(toDate(item.startDate), today()) >= 7
				) {
					children.push({
						kind: "taskItem",
						value: item,
					} as TaskItemBlock);
				}

				if (
					item.deadline !== undefined &&
					differenceInCalendarDays(toDate(item.deadline), today()) >= 7
				) {
					children.push({
						kind: "deadline",
						value: {
							_id: item._id,
							title: item.title,
							isCompleted: item.isCompleted,
							date: toDate(item.deadline),
						},
					} as DeadlineBlock);
				}
			}

			return {
				kind: "date",
				value: {date: addDays(today(), 7)}, // Placeholder value, not used for display
				children,
			} as DateBlock;
		}
	}, [taskItems]);

	return (
		<div className="flex flex-col gap-12">
			{blocks.map((block) => (
				<Block
					key={block.value.date.toISOString()}
					block={block}
					selectedTaskItem={selectedTaskItem}
					setSelectedTaskItem={setSelectedTaskItem}
					taskItemActions={taskItemActions}
				/>
			))}
			{
				extraBlock && (
					<div>
						<div className="group flex flex-row items-center gap-4 px-3 select-none">
							<h2 className="text-xl text-slate-400">Following week</h2>
						</div>

						<hr className="mt-2 mb-4 border-slate-700" />

						<BlockChildren
							block={extraBlock}
							selectedTaskItem={selectedTaskItem}
							setSelectedTaskItem={setSelectedTaskItem}
							taskItemActions={taskItemActions}
							specificDeadline
						/>
					</div>
				)
			}
		</div>
	);
}

export function Block({ block, selectedTaskItem, setSelectedTaskItem, taskItemActions }:
	Pick<UpcomingLayoutProps, "selectedTaskItem" | "setSelectedTaskItem" | "taskItemActions"> &
	{
		block: DateBlock;
	}
) {
	const {isDropTarget, ref} = useDroppable({
		id: createDropId(block.value.date.toISOString(), "startDate", "mainView", block.value.date.toISOString()),
		accept: "taskItem",
	});

	return (
		<div ref={ref} className={isDropTarget ? "rounded-md bg-green-500/20" : ""}>
			<div className="group flex flex-row items-center gap-4 px-3 select-none">
				<div className="flex flex-row gap-3 items-end">
					{/*DAY NUMBER*/}
					<div className="flex flex-col items-center">
						{today().getMonth() !== block.value.date.getMonth() ?
							<p className="text-sm">
								{format(block.value.date, "MMM").toLowerCase()}
							</p>
							:	null}
						<h2 className="text-3xl font-bold font-mono">
							{block.value.date.getDate().toString().padStart(2, "0")}
						</h2>
					</div>

					{/*DAY NAME*/}
					<div
						className={`flex flex-row gap-2 items-center ${isToday(block.value.date) ? "text-white" : "text-slate-400"}`}
					>
						<h2 className="text-xl">
							{isToday(block.value.date) ? "Today" : format(block.value.date, "EEEE")}
						</h2>
						<button
							className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white duration-100"
							onClick={() =>
								taskItemActions.create(undefined, toExactDate(block.value.date))
							}
						>
							<IconPlus size={24} />
						</button>
					</div>
				</div>
			</div>

			<hr className="mt-2 mb-4 border-slate-700" />

			<BlockChildren
				block={block}
				selectedTaskItem={selectedTaskItem}
				setSelectedTaskItem={setSelectedTaskItem}
				taskItemActions={taskItemActions}
			/>
		</div>
	);
}

export function BlockChildren({
	block,
	selectedTaskItem,
	setSelectedTaskItem,
	taskItemActions,
	specificDeadline,
}: Pick<UpcomingLayoutProps, "selectedTaskItem" | "setSelectedTaskItem" | "taskItemActions"> & {
	block: DateBlock;
	specificDeadline?: boolean;
}) {
	return (
		<>
			{block.children
				.sort((a, b) => {
					// 1. Priority Priority: Deadlines first
					if (a.kind === "deadline" && b.kind !== "deadline") return -1;
					if (a.kind !== "deadline" && b.kind === "deadline") return 1;

					// 2. Date Comparison (The Tie-breaker)
					const ad = a.kind === "taskItem" ? toDateOrUndefined(a.value.startDate) : a.value.date;
					const bd = b.kind === "taskItem" ? toDateOrUndefined(b.value.startDate) : b.value.date;

					if (ad === undefined && bd === undefined) return 0;
					if (ad === undefined) return 1;
					if (bd === undefined) return -1;

					return ad.getTime() - bd.getTime();
				})
				.map((item) => {
					if (item.kind === "taskItem") {
						return (
							<TaskItemLayout
								key={item.value._id}
								taskItem={item.value}
								isSelected={selectedTaskItem === item.value._id}
								showTodayIcon
								hideStartDateBadge
								thisActions={{
									create: null,
									modify: taskItemActions.modify.bind(null, item.value._id),
									delete: null,
								}}
								selectThis={() => setSelectedTaskItem(item.value._id)}
							/>
						);
					} else if (item.kind === "deadline") {
						return (
							<div
								className={`group px-4 mb-2 flex flex-row items-center gap-5 ${item.value.isCompleted ? "line-through text-slate-400" : "text-white"}     rounded-lg cursor-pointer duration-200`}
								onClick={(e) => {
									e.stopPropagation();
									setSelectedTaskItem(item.value._id);
								}}
								key={item.value._id + "-deadline"}
							>
								<RichIcon iconData={Constants.Icons.DEADLINE} size={16} />
								<p className="text-sm underline-offset-2">
									<span className="group-hover:underline">
										{item.value.title}
									</span>{" "}
									<span className="pl-4 text-slate-400">
										{specificDeadline ? format(item.value.date, "MM/dd 'at' HH:mm") : format(item.value.date, "HH:mm")}
									</span>
								</p>
							</div>
						);
					}
				})}
		</>
	);
}
