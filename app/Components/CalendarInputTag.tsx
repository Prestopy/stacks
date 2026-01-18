import DateSelector, {
	DropdownCalendarOptions,
} from "@/app/Components/DateSelector";
import InputTag from "@/app/Components/InputTag";
import { DateOrSomeday, IconData } from "@/app/util/types";
import { useState } from "react";
import { getDifferenceInDaysAsString, isExactDate, isLate } from "@/app/util/dateUtilities";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import * as React from "react";

interface CalendarInputTagProps {
	date: DateOrSomeday | undefined;
	placeholder?: string;
	label?: string;
	icon: IconData;

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
	updateDate: (modifications: DateOrSomeday | undefined) => void;

	options?: DropdownCalendarOptions;
}
export default function CalendarInputTag({
	date,
	placeholder,
	icon,
	label,
	disabledDays,
	updateDate,
	options,
}: CalendarInputTagProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger>
				<div
					className={`${date?.kind === "date" && isLate(date.value) ? "text-red-500" : ""}`}
				>
					<InputTag
						open={open}
						icon={icon}
						isUnset={date === undefined}
					>
						<p>
							{date && label ?
								<b>{label}: </b>
							:	null}
							{date ?
								date.kind === "someday" ?
									"Someday"
								:	isExactDate(date.value) ? date.value.toLocaleDateString() : date.value.toLocaleString()
							:	(placeholder ?? "Select date...")}
							{date && date.kind === "date" && (
								<span className="text-slate-400">
									{" "}
									{getDifferenceInDaysAsString(
										date.value,
										new Date(),
									)}
								</span>
							)}
						</p>
					</InputTag>
				</div>
			</PopoverTrigger>

			<PopoverContent
				className="w-[212px] overflow-hidden p-0"
				align="start"
			>
				<DateSelector
					open={open}
					setOpen={setOpen}
					date={date}
					disabledDays={disabledDays}
					onDateChange={(newDate) => {
						updateDate(newDate);
						console.log("date change triggered");
					}}
					options={options}
				/>
			</PopoverContent>
		</Popover>
	);
}
