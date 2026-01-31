import { Doc } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { TaskItemModifications } from "@/app/util/types/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
	bigintToDateOrUndefined,
	capitalize,
	dateToPatch,
	debounce,
	toDateOrSomedayOrUndefined,
} from "@/app/util/utilities";
import CalendarInputTag from "@/app/Components/CalendarInputTag";
import { IconFileDescription } from "@tabler/icons-react";
import Constants from "@/app/util/constants";
import FlaggedInputTag from "@/app/Components/FlaggedInputTag";
import {
	formatDateAsRelative,
	getDifferenceInDaysAsString,
	isLateOrToday,
	isToday,
	isLate,
} from "@/app/util/dateUtilities";
import LabelWithIcon from "@/app/Components/LabelWithIcon";
import RichIcon from "@/app/Components/RichIcon";
import { DateOrSomeday } from "@/app/util/types/baseTypes";
import { ThisActions } from "@/app/util/types/typeUtilities";

interface TaskItemLayoutProps {
	taskItem: Doc<"taskItems">;
	isSelected: boolean;

	thisActions: ThisActions<
		(mods: TaskItemModifications) => void,
		null
	>
	selectThis: () => void;
}

export default function TaskItemLayout({
	taskItem,
	thisActions,
	isSelected,
	selectThis,
}: TaskItemLayoutProps) {
	const [tempTextFields, setTempTextFields] = useState<{
		title: string;
		note: string | undefined;
	}>({
		title: taskItem.title,
		note: taskItem.note,
	});
	const tempTextFieldsRef = useRef(tempTextFields);
	useEffect(() => {
		tempTextFieldsRef.current = tempTextFields;
	}, [tempTextFields]);

	// For animations
	const [optimisticCompleted, setOptimisticCompleted] = useState<boolean | null>(null);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);
	const isCompleted = optimisticCompleted ?? taskItem.isCompleted;

	const debouncedTextSave = useRef(
		debounce(() => {
			thisActions.modify({
				title: tempTextFieldsRef.current.title,
				note: tempTextFieldsRef.current.note,
			});
			console.log("saved title & note");
		}, 1000),
	).current;

	return (
		<div
			className={`px-4 mb-2 flex flex-row gap-5 ${isSelected ? "bg-slate-800 py-4" : "bg-transparent py-0"}     rounded-lg duration-200`}
			onClick={(e) => {
				e.stopPropagation();
				selectThis();
			}}
		>
			<div className="flex items-center justify-between">
				<Checkbox
					className={taskItem.isFlagged && !isCompleted ? "!bg-purple-900" : undefined}
					style={{
						borderColor:
							taskItem.isFlagged && !isCompleted ?
								Constants.Colors.FLAGGED_PURPLE
							:	undefined,
					}}
					checked={isCompleted}
					onClick={(e) => e.stopPropagation()}
					onCheckedChange={(checked) => {
						if (debounceTimer.current !== null) {
							clearTimeout(debounceTimer.current);
							debounceTimer.current = null;
						}

						setOptimisticCompleted(!(checked === false)); // interpret indeterminate as true

						if (!isCompleted) {
							// going to become true
							debounceTimer.current = setTimeout(() => {
								thisActions.modify({ isCompleted: true });
								setOptimisticCompleted(null);
								debounceTimer.current = null;
							}, 1000);
						} else {
							thisActions.modify({ isCompleted: false });
							setOptimisticCompleted(null);
						}
					}}
				/>
			</div>

			<div className="flex flex-col flex-1 w-full task-select-zone">
				{!isSelected ?
					<div className="flex flex-row justify-between">
						<h2 className="text-lg">
							{taskItem.startDate && !isToday(taskItem.startDate) ?
								<span
									className={`inline-flex align-middle mr-2 px-2 py-0.5
											${
												!isLate(taskItem.startDate) ?
													"bg-slate-700 text-slate-300"
												:	"bg-red-500 text-white"
											} text-sm rounded-md
										`}
								>
									<p>
										{capitalize(
											formatDateAsRelative(taskItem.startDate, new Date()),
										)}
									</p>
								</span>
							: taskItem.startDate && isToday(taskItem.startDate) ?
								<span className="inline-flex align-middle mr-2 leading-[1em] h-[1em]">
									<RichIcon iconData={Constants.Icons.TODAY} size={16} />
								</span>
							:	null}

							{tempTextFields.title}

							{(taskItem.note?.length ?? 0) > 0 && (
								<span className="inline-flex align-middle ml-2 leading-[1em] h-[1em] text-slate-400">
									<IconFileDescription size={16} />
								</span>
							)}
						</h2>

						{taskItem.deadline && (
							<div className="px-2 shrink-0 flex items-center justify-between text-sm select-none">
								<LabelWithIcon
									iconData={Constants.Icons.DEADLINE}
									size={16}
									className={
										!isLateOrToday(taskItem.deadline) ? "text-slate-400" : (
											`text-red-500`
										)
									}
								>
									<p className="text-sm">
										{capitalize(
											getDifferenceInDaysAsString(
												taskItem.deadline,
												new Date(),
											),
										)}
									</p>
								</LabelWithIcon>
							</div>
						)}
						{/*<p className="text-sm text-slate-400">{tempTextFields.note}</p>*/}
					</div>
				:	<>
						<div className="flex flex-row">
							<input
								type="text"
								className="w-full text-lg leading-none text-white placeholder-slate-400"
								placeholder="Title..."
								value={tempTextFields.title}
								onChange={(e) => {
									setTempTextFields({
										...tempTextFields,
										title: e.target.value,
									});
									debouncedTextSave();
								}}
								autoFocus
							/>
						</div>
						<textarea
							className="w-full min-h-8 h-16 max-h-32 mt-2 text-slate-300 placeholder-slate-400"
							placeholder="Note..."
							value={tempTextFields.note}
							onChange={(e) => {
								setTempTextFields({
									...tempTextFields,
									note: e.target.value,
								});
								debouncedTextSave();
							}}
						></textarea>

						<div className="mt-2 flex flex-col gap-1 w-fit">
							<CalendarInputTag
								date={toDateOrSomedayOrUndefined(
									bigintToDateOrUndefined(taskItem.startDate),
									taskItem.isSomeday,
								)}
								placeholder="Start date..."
								icon={
									taskItem.isSomeday ? Constants.Icons.SOMEDAY
									: (
										taskItem.startDate &&
										isToday(new Date(Number(taskItem.startDate)))
									) ?
										Constants.Icons.TODAY
									:	Constants.Icons.START_DATE
								}
								disabledDays={
									taskItem.deadline !== undefined ?
										{
											after: new Date(Number(taskItem.deadline)),
										}
									:	undefined
								}
								updateDate={(newDate: DateOrSomeday | undefined) => {
									const { value, isSomeday } = dateToPatch(newDate);

									// if (newDate && newDate.kind === "date" && taskItem.deadline) {
									// 	const d = new Date(Number(taskItem.deadline));
									// 	d.setHours(0, 0, 0, 0);
									// 	if (newDate.value > d) return;
									// }
									console.log(newDate);

									thisActions.modify({
										startDate: value,
										isSomeday: isSomeday ?? false,
									});
								}}
							/>
							<CalendarInputTag
								date={toDateOrSomedayOrUndefined(
									bigintToDateOrUndefined(taskItem.deadline),
									false,
								)}
								placeholder="Deadline..."
								label="Deadline"
								icon={Constants.Icons.DEADLINE}
								disabledDays={
									taskItem.startDate !== undefined && !taskItem.isSomeday ?
										{
											before: new Date(Number(taskItem.startDate)),
										}
									:	undefined
								}
								updateDate={(newDate: DateOrSomeday | undefined) => {
									const { value } = dateToPatch(newDate, {
										allowSomeday: false,
									});

									if (newDate && newDate.kind === "date" && taskItem.startDate) {
										const d = new Date(Number(taskItem.startDate));
										d.setHours(0, 0, 0, 0);
										if (newDate.value < d) return;
									}

									thisActions.modify({
										deadline: value,
									});
								}}
								options={{
									hideQuickOptions: true,
									disallowSomeday: true,
								}}
							/>
							<FlaggedInputTag
								isFlagged={taskItem.isFlagged}
								updateIsFlagged={(newIsFlagged) => {
									thisActions.modify({
										isFlagged: newIsFlagged,
									});
								}}
							/>
						</div>
					</>
				}
			</div>
		</div>
	);
}
