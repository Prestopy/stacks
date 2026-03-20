import { Doc } from "@/convex/_generated/dataModel";
import {
	ProjectView,
	UniverseView,
} from "@/app/util/types/types";
import { DateOrSomeday, TaskView } from "@/app/util/types/baseTypes";
import { toDate } from "@/app/util/dateUtilities";

export function capitalize(str: string) {
	if (str.length === 0) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function filterTaskItems(taskItems: Doc<"taskItems">[], view: TaskView) {
	const filteredTodos = taskItems;

	if (view.kind === "systemFilter") {
		switch (view.id) {
			case "inbox":
				return filteredTodos.filter(
					(todo) => !todo.isCompleted && !todo.parentUniverse,
				);
			case "today": {
				const startOfTomorrow = new Date();
				startOfTomorrow.setHours(24, 0, 0, 0);

				return filteredTodos.filter(
					(todo) =>
						!todo.isCompleted &&
						todo.startDate !== undefined &&
						toDate(todo.startDate).getTime() < startOfTomorrow.getTime(),
				);
			}
			case "everything":
				return filteredTodos.filter((todo) => !todo.isCompleted && !todo.isSomeday);
			case "flagged":
				return filteredTodos.filter(
					(todo) => !todo.isCompleted && todo.isFlagged,
				);
			case "someday":
				return filteredTodos.filter(
					(todo) => !todo.isCompleted && todo.isSomeday,
				);
			case "schedule":
				return filteredTodos.filter(
					(todo) => todo.startDate !== undefined || todo.deadline !== undefined,
				);
			case "completed":
				return filteredTodos.filter((todo) => todo.isCompleted);
			default:
				return filteredTodos;
		}
	} else if (view.kind === "project") {
		return filteredTodos.filter(
			(todo) =>
				!todo.isCompleted &&
				todo.parentProject?.toString() === view.id.toString(),
		);
	} else if (view.kind === "universe") {
		return filteredTodos.filter(
			(todo) =>
				!todo.isCompleted &&
				todo.parentUniverse?.toString() === view.id.toString() &&
				!todo.parentProject, // Exclude project tasks
		);
	}

	return filteredTodos;
}

export function filterTaskFolders(
	taskFolders: Doc<"taskFolders">[],
	view: UniverseView | ProjectView,
) {
	return taskFolders.filter((folder) => {
		if (view.kind === "universe") {
			return (
				view.id.toString() === folder.parentUniverse.toString() &&
				folder.parentProject === undefined
			);
		} else if (view.kind === "project") {
			return view.id.toString() === folder.parentProject?.toString();
		}

		return false;
	});
}

export function debounce(func: () => void, wait: number) {
	let timeout: NodeJS.Timeout | null;

	return () => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			func();
		}, wait);
	};
}

// FIXME: move to date utilities
// if only in one file, js move to that file- very specific...
export function dateToPatch(
	date: DateOrSomeday | undefined,
	opts?: { allowSomeday?: boolean },
): { value: bigint | null; isSomeday?: boolean } {
	if (!date) {
		return { value: null, isSomeday: false };
	}

	if (date.kind === "someday") {
		if (opts && !opts.allowSomeday) {
			return { value: null };
		}
		return { value: null, isSomeday: true };
	}

	return {
		value: BigInt(date.value.getTime()),
		isSomeday: false,
	};
}

// FIXME: remove this
export function toDateOrSomedayOrUndefined(
	date: Date | undefined,
	isSomeday: boolean,
): DateOrSomeday | undefined {
	if (date === undefined) {
		if (!isSomeday) return undefined;
		return { kind: "someday" };
	}
	return { kind: "date", value: date };
}
