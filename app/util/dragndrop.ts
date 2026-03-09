const DND_ID_WHERE = ["sidebar", "mainView"] as const;

const DRAG_ID_KIND = ["taskItem", "deadline", "taskFolder", "project", "universe"] as const;
const DROP_ID_KIND = ["taskFolder", "project", "universe", "systemFilter", "noTaskFolder", "dateZone"] as const;

type DndIdWhere = typeof DND_ID_WHERE[number];
type DragIdKind = typeof DRAG_ID_KIND[number];
type DropIdKind = typeof DROP_ID_KIND[number];

export function createDragId(id: string, kind: DragIdKind, where: DndIdWhere) {
	if (id?.includes("=")) throw new Error(`Id cannot include "=". Invalid id: ${id}`);
	return `drag=${kind}=${id ?? ""}=${where}`;
}

/**
 * Create a droppable zone ID
 * @param id
 * @param kind
 * @param where
 * @param additional used for action information. For example, to dictate the start date the task item should be set to on drop.
 */
export function createDropId(id: string, kind: DropIdKind, where: DndIdWhere, additional: string = "") {
	if (id.includes("=")) throw new Error(`Id cannot include "=". Invalid id: ${id}`);
	if (additional.includes("=")) throw new Error(`Additional note cannot include "=". Invalid note: ${additional}`);
	return `drop=${kind}=${id ?? ""}=${where}=${additional}`;
}

function parseDndId<T extends string>(id: string, dndIdKind: readonly string[]): {id: string, kind: T, where: DndIdWhere} {
	const [_, kind, rawId, where] = id.split("=");

	if (!DND_ID_WHERE.includes(where as DndIdWhere)) {
		throw new Error(`Invalid DND ID: ${id}. Invalid where: ${where}`);
	} else if (!dndIdKind.includes(kind as T)) {
		throw new Error(`Invalid DND ID: ${id}. Invalid kind: ${kind}`);
	}

	return { id: rawId, kind: kind as T, where: where as DndIdWhere };
}

export function parseDragId(id: string): { id: string; kind: DragIdKind; where: DndIdWhere } {
	return parseDndId<DragIdKind>(id, DRAG_ID_KIND);
}
export function parseDropId(id: string): { id: string; kind: DropIdKind; where: DndIdWhere, additional: string | null } {
	const parsed = id.split("=");
	if (parsed.length >= 5) return { ...parseDndId<DropIdKind>(id, DROP_ID_KIND), additional: parsed[4] };
	else return { ...parseDndId<DropIdKind>(id, DROP_ID_KIND), additional: null };
}
