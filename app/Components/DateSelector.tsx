"use client";

import * as chrono from "chrono-node";

import * as React from "react";
import {
	IconArchiveFilled,
	IconCalendarWeekFilled,
	IconPlayerSkipForward,
	IconTrash,
} from "@tabler/icons-react";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import Constants from "@/app/util/constants";
import RichIcon from "@/app/Components/RichIcon";
import { today } from "@/app/util/dateUtilities";
import { DateOrSomeday } from "@/app/util/types/baseTypes";

// originally calendar-22.tsx
export interface DropdownCalendarOptions {
	disallowSomeday?: boolean;
	hideQuickOptions?: boolean;
}
interface DropdownCalendarProps {
	open: boolean;
	setOpen: (value: boolean) => void;

	date: DateOrSomeday | undefined;
	disabledDays?:
		| {
				before: Date;
				after?: undefined;
		  }
		| {
				before?: undefined;
				after: Date;
		  }
		| {
				before: Date;
				after: Date;
		  };
	onDateChange: (date: DateOrSomeday | undefined) => void;

	options?: DropdownCalendarOptions;
}

// FIXME: DateSelector shouldn't be responsible for resetting its internal state when closed or for setting open/closed state
export default function DateSelector({
	open,
	setOpen,
	date,
	disabledDays,
	onDateChange,
	options,
}: DropdownCalendarProps) {
	const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
	const [naturalLangInput, setNaturalLangInput] = useState<string>("");

	const isValid = (date: Date) => {
		const invalidBefore =
			disabledDays?.before ? new Date(disabledDays.before) : undefined;
		const invalidAfter =
			disabledDays?.after ? new Date(disabledDays.after) : undefined;

		invalidBefore?.setHours(0, 0, 0, 0);
		invalidAfter?.setHours(24, 0, 0, 0);

		return (
			(invalidBefore ? date >= invalidBefore : true) &&
			(invalidAfter ? date < invalidAfter : true)
		);
	};

	useEffect(() => {
		if (!open) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setTempDate(undefined);
			setNaturalLangInput("");
		}
	}, [open]);
	const updateOpenState = (value: boolean) => {
		setOpen(value);
		if (!open) {
			setTempDate(undefined);
			setNaturalLangInput("");
		}
	};

	const updateNaturalLangInput = (value: string) => {
		setNaturalLangInput(value);

		// forwardDate: assume into the future
		const refDate = new Date();
		// refDate.setHours(0, 0, 0, 0);

		const customChrono = chrono.casual.clone();
		customChrono.refiners.push({
			refine: (context, results) => {
				results.forEach((result) => {
					// If no time is specified, set to 00:00
					if (
						!result.start.isCertain("hour") &&
						!result.start.isCertain("minute")
					) {
						result.start.assign("hour", 0);
						result.start.assign("minute", 0);
						result.start.assign("second", 0);
						result.start.assign("millisecond", 0);
					}
				});
				return results;
			},
		});

		const parsedDate = customChrono.parseDate(value, refDate, {
			forwardDate: true,
		});

		if (parsedDate) {
			setTempDate(parsedDate);
		} else {
			setTempDate(undefined);
		}
	};
	const updateDate = (date: DateOrSomeday | undefined) => {
		if (
			date === undefined ||
			date.kind === "someday" ||
			isValid(date.value)
		) {
			onDateChange(date);
			updateOpenState(false);
		}
	};
	const formatDate = (date: Date) => {
		// Ignore MS
		if (
			date.getHours() === 0 &&
			date.getMinutes() === 0 &&
			date.getSeconds() === 0
		) {
			return date.toLocaleDateString();
		} else {
			const hours = date.getHours();
			const minutes = date.getMinutes();
			return `${date.toLocaleDateString()} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		}
	};

	return (
		<div className="flex flex-col bg-slate-900">
			<input
				type="text"
				value={naturalLangInput}
				onChange={(e) => updateNaturalLangInput(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && tempDate && isValid(tempDate)) {
						updateDate({
							kind: "date",
							value: tempDate,
						});
						updateOpenState(false);
					}
				}}
				placeholder="When..."
				autoFocus
				className="w-full py-2 placeholder-muted-foreground text-sm text-center"
			/>

			{naturalLangInput.length === 0 && !options?.hideQuickOptions && (
				<div className="px-2 flex flex-col mb-2">
					<button
						className="px-2 py-1 text-sm text-center w-full flex flex-row gap-2 justify-center items-center not-disabled:hover:bg-slate-800 disabled:opacity-50 duration-100 rounded-sm"
						disabled={!isValid(today())}
						onClick={() => {
							updateDate({
								kind: "date",
								value: today(),
							});
						}}
					>
						<RichIcon iconData={Constants.Icons.TODAY} size={16} />
						Today
					</button>
				</div>
			)}

			{naturalLangInput.length === 0 && (
				<Calendar
					mode="single"
					selected={date?.kind === "date" ? date.value : undefined}
					disabled={disabledDays}
					modifiers={{
						beforeToday: { before: new Date() },
						disallowed: disabledDays,
					}}
					modifiersClassNames={{
						beforeToday: "[&>button]:opacity-60",
						disallowed: "[&>button]:line-through",
					}}
					onSelect={(date) => {
						if (date === undefined) {
							updateDate(undefined);
						} else {
							updateDate({
								kind: "date",
								value: date,
							});
						}
					}}
					className="p-2 pt-0 [--cell-size:--spacing(7)]"
				/>
			)}

			<div className="px-2 flex flex-col">
				{naturalLangInput.length > 0 && tempDate && (
					<button
						className={`px-2 py-1 mb-2 text-sm disabled:opacity-50 disabled:line-through not-disabled:hover:bg-slate-800 text-center w-full flex flex-row gap-2 justify-center items-center duration-100 rounded-sm`}
						disabled={!isValid(tempDate)}
						onClick={(e) => {
							if (!isValid(tempDate)) {
								e.stopPropagation();
								return;
							}

							if (tempDate === undefined) {
								updateDate(undefined);
							} else {
								updateDate({
									kind: "date",
									value: tempDate,
								});
							}
						}}
					>
						<IconCalendarWeekFilled
							size={16}
							color={Constants.Colors.SCHEDULED_RED}
						/>
						{formatDate(tempDate)}
					</button>
				)}
				{naturalLangInput.length === 0 &&
					!options?.hideQuickOptions && (
						<div className="mb-2">
							<button
								className="px-2 py-1 text-sm text-center w-full flex flex-row gap-2 justify-center items-center not-disabled:hover:bg-slate-800 disabled:opacity-50 duration-100 rounded-sm"
								disabled={
									!isValid(
										new Date(today().setHours(24, 0, 0, 0)),
									)
								}
								onClick={() => {
									updateDate({
										kind: "date",
										value: new Date(
											new Date().setHours(24, 0, 0, 0),
										),
									});
								}}
							>
								<IconPlayerSkipForward
									size={16}
									color={Constants.Colors.INBOX_BLUE}
								/>
								Tomorrow
							</button>
							<button
								className="px-2 py-1 text-sm text-center w-full flex flex-row gap-2 justify-center items-center not-disabled:hover:bg-slate-800 disabled:opacity-50 duration-100 rounded-sm"
								onClick={() => {
									updateDate({
										kind: "someday",
									});
								}}
							>
								<IconArchiveFilled
									size={16}
									color={Constants.Colors.SOMEDAY_BROWN}
								/>
								Someday
							</button>
						</div>
					)}

				{date !== undefined && (
					<button
						className="px-2 py-1 mb-2 text-sm text-slate-400 hover:text-red-500 text-center w-full flex flex-row gap-2 justify-center items-center hover:bg-slate-800 duration-100 rounded-sm"
						onClick={(e) => {
							e.preventDefault();
							updateDate(undefined);
						}}
					>
						<IconTrash size={16} />
						Clear
					</button>
				)}
			</div>
		</div>
	);
}
