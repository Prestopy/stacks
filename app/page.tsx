"use client";

import Sidebar from "@/app/Components/Sidebar";
import MainView from "@/app/MainView";
import { useMemo, useState } from "react";
import {
	ProjectModifications,
	TaskFolderModifications,
	TaskItemModifications,
	UniverseModifications,
} from "@/app/util/types/types";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { filterTaskFolders, filterTaskItems } from "@/app/util/utilities";
import Actionbar from "@/app/Components/Actionbar";

import { IconsProvider } from "tabler-dynamic-icon";
import * as TablerIcons from "@tabler/icons-react";
import Constants from "@/app/util/constants";
import { Spinner } from "@/components/ui/spinner";
import { toBigInt, toDateOrUndefined, today } from "@/app/util/dateUtilities";
import { TaskView, ViewId } from "@/app/util/types/baseTypes";
import { getViewFromId, toProjectView, toUniverseView } from "@/app/util/conversionLayers";
import { DragDropProvider } from "@dnd-kit/react";
import { parseDragId, parseDropId } from "@/app/util/dragndrop";
import { parseISO } from "date-fns";
import { Draggable, Droppable } from "@dnd-kit/dom";
import { UniversalContext } from "@/app/TheUniverseManager";

export default function Home() {
	// Queries
	const allUniverses = useQuery(api.universes.get);
	const allProjects = useQuery(api.projects.get);
	const allTaskFolders = useQuery(api.taskFolders.get);
	const allTaskItems: Doc<"taskItems">[] | undefined = useQuery(api.taskItems.get);

	const withUniverse = (universeId: Id<"universes">): Doc<"universes"> | null => {
		return allUniverses?.find((u) => u._id.toString() === universeId.toString()) ?? null;
	};
	const withProject = (projectId: Id<"projects">): Doc<"projects"> | null => {
		return allProjects?.find((p) => p._id.toString() === projectId.toString()) ?? null;
	};
	const withTaskFolder = (taskFolderId: Id<"taskFolders">): Doc<"taskFolders"> | null => {
		return allTaskFolders?.find((tf) => tf._id.toString() === taskFolderId.toString()) ?? null;
	};
	const withTaskItem = (taskItemId: Id<"taskItems">): Doc<"taskItems"> | null => {
		return allTaskItems?.find((ti) => ti._id.toString() === taskItemId.toString()) ?? null;
	};

	// State
	const [selectedViewId, setSelectedViewId] = useState<ViewId>(Constants.FilterViews.INBOX.id);
	const [selectedTaskItem, setSelectedTaskItem] = useState<Id<"taskItems"> | null>(null);

	const navigateToTaskItem = (taskItemId: Id<"taskItems"> | null) => {
		setSelectedTaskItem(taskItemId);

		if (taskItemId === null || selectedView.kind === "systemFilter") return;

		const taskItem = withTaskItem(taskItemId);
		if (!taskItem) return;

		if (taskItem.parentProject) {
			setSelectedViewId(taskItem.parentProject);
		} else if (taskItem.parentUniverse) {
			setSelectedViewId(taskItem.parentUniverse);
		} else {
			setSelectedViewId(Constants.FilterViews.INBOX.id);
		}
	}

	const viewHierarchy = useMemo(() => {
		if (allUniverses === undefined || allProjects === undefined) return [];
		return allUniverses.map((universe) => {
			if (
				allProjects.some(
					(project) => project.parentUniverse.toString() === universe._id.toString(),
				)
			) {
				return {
					kind: "data" as const,
					view: toUniverseView(universe),
					childData: allProjects
						.filter(
							(project) =>
								project.parentUniverse.toString() === universe._id.toString(),
						)
						.map((project) => ({
							kind: "data" as const,
							view: toProjectView(project),
							deadline: toDateOrUndefined(project.deadline),
						})),
				};
			} else {
				return {
					kind: "data" as const,
					view: toUniverseView(universe),
				};
			}
		});
	}, [allUniverses, allProjects]);
	const selectedView = useMemo(() => {
		const defaultView = Constants.FilterViews.INBOX;
		if (!allUniverses || !allProjects) {
			return defaultView;
		}
		const view = getViewFromId(selectedViewId, allUniverses, allProjects);

		if (!view) return defaultView;
		return view;
	}, [selectedViewId, allUniverses, allProjects]);

	const taskItemsForView = useMemo(
		() => filterTaskItems(allTaskItems ?? [], selectedView),
		[allTaskItems, selectedView],
	);
	const taskFoldersForView = useMemo(() => {
		if (selectedView.kind === "universe" || selectedView.kind === "project") {
			return filterTaskFolders(allTaskFolders ?? [], selectedView);
		} else {
			return [];
		}
	}, [allTaskFolders, selectedView]);

	// Mutations
	const addTaskItem = useMutation(api.taskItems.createTaskItem);
	// https://docs.convex.dev/client/react/optimistic-updates
	const updateTaskItem = useMutation(api.taskItems.updateTaskItem).withOptimisticUpdate(
		(localStore, args) => {
			const { _taskId, modifications } = args;
			const currentValue = localStore.getQuery(api.taskItems.get);
			if (!currentValue) return;

			const updatedValue = currentValue.map((taskItem) => {
				if (taskItem._id.toString() === _taskId.toString()) {
					const serializedModifications = { ...modifications };
					for (const key in serializedModifications) {
						if (
							serializedModifications[key as keyof typeof serializedModifications] ===
							null
						) {
							serializedModifications[key as keyof typeof serializedModifications] =
								undefined;
						}
					}
					return { ...taskItem, ...serializedModifications };
				}
				return taskItem;
			});

			// @ts-expect-error - the updated values already conform to that type (the mapping thur keys)
			localStore.setQuery(api.taskItems.get, {}, updatedValue);
		},
	);
	const removeTaskItem = useMutation(api.taskItems.deleteTaskItem).withOptimisticUpdate(
		(localStore, args) => {
			const { _taskId } = args;
			const currentValue = localStore.getQuery(api.taskItems.get);
			if (!currentValue) return;

			const updatedValue = currentValue.filter(
				(taskItem) => taskItem._id.toString() !== _taskId.toString(),
			);

			localStore.setQuery(api.taskItems.get, {}, updatedValue);
		},
	);

	const addTaskFolder = useMutation(api.taskFolders.createTaskFolder);
	const updateTaskFolder = useMutation(api.taskFolders.updateTaskFolder).withOptimisticUpdate(
		(localStore, args) => {
			const { _taskFolderId, modifications } = args;
			const currentValue = localStore.getQuery(api.taskFolders.get);
			if (!currentValue) return;

			const updatedValue = currentValue.map((taskFolder) => {
				if (taskFolder._id.toString() === _taskFolderId.toString()) {
					const serializedModifications = { ...modifications };
					for (const key in serializedModifications) {
						if (
							serializedModifications[key as keyof typeof serializedModifications] ===
							null
						) {
							serializedModifications[key as keyof typeof serializedModifications] =
								undefined;
						}
					}
					return { ...taskFolder, ...serializedModifications };
				}
				return taskFolder;
			});

			// @ts-expect-error - the updated values already conform to that type (the mapping thru keys)
			localStore.setQuery(api.taskFolders.get, {}, updatedValue);
		},
	);
	const removeTaskFolder = useMutation(api.taskFolders.deleteTaskFolder).withOptimisticUpdate(
		(localStore, args) => {
			const { _taskFolderId } = args;
			const currentValue = localStore.getQuery(api.taskFolders.get);
			if (!currentValue) return;

			const updatedValue = currentValue.filter(
				(taskFolder) => taskFolder._id.toString() !== _taskFolderId.toString(),
			);

			localStore.setQuery(api.taskFolders.get, {}, updatedValue);
		},
	);

	const addUniverse = useMutation(api.universes.createUniverse);
	const updateUniverse = useMutation(api.universes.updateUniverse).withOptimisticUpdate(
		(localStore, args) => {
			const { _universeId, modifications } = args;
			const currentValue = localStore.getQuery(api.universes.get);
			if (!currentValue) return;

			const updatedValue = currentValue.map((universe) => {
				if (universe._id.toString() === _universeId.toString()) {
					const serializedModifications = { ...modifications };
					for (const key in serializedModifications) {
						if (
							serializedModifications[key as keyof typeof serializedModifications] ===
							null
						) {
							serializedModifications[key as keyof typeof serializedModifications] =
								undefined;
						}
					}
					return { ...universe, ...serializedModifications };
				}
				return universe;
			});

			// @ts-expect-error - the updated values already conform to that type (the mapping thru keys)
			localStore.setQuery(api.universes.get, {}, updatedValue);
		},
	);
	const removeUniverse = useMutation(api.universes.deleteUniverse).withOptimisticUpdate(
		(localStore, args) => {
			const { _universeId } = args;
			const currentValue = localStore.getQuery(api.universes.get);
			if (!currentValue) return;

			const updatedValue = currentValue.filter(
				(universe) => universe._id.toString() !== _universeId.toString(),
			);

			localStore.setQuery(api.universes.get, {}, updatedValue);
		},
	);

	const addProject = useMutation(api.projects.createProject);
	const updateProject = useMutation(api.projects.updateProject).withOptimisticUpdate(
		(localStore, args) => {
			const { _projectId, modifications } = args;
			const currentValue = localStore.getQuery(api.projects.get);
			if (!currentValue) return;

			const updatedValue = currentValue.map((project) => {
				if (project._id.toString() === _projectId.toString()) {
					const serializedModifications = { ...modifications };
					for (const key in serializedModifications) {
						if (
							serializedModifications[key as keyof typeof serializedModifications] ===
							null
						) {
							serializedModifications[key as keyof typeof serializedModifications] =
								undefined;
						}
					}
					return { ...project, ...serializedModifications };
				}
				return project;
			});

			// @ts-expect-error - the updated values already conform to that type (the mapping thru keys)
			localStore.setQuery(api.projects.get, {}, updatedValue);
		},
	);
	const removeProject = useMutation(api.projects.deleteProject).withOptimisticUpdate(
		(localStore, args) => {
			const { _projectId } = args;
			const currentValue = localStore.getQuery(api.projects.get);
			if (!currentValue) return;

			const updatedValue = currentValue.filter(
				(project) => project._id.toString() !== _projectId.toString(),
			);

			localStore.setQuery(api.projects.get, {}, updatedValue);
		},
	);

	// Handlers
	const createTaskItem = async (view: TaskView, taskFolder?: Id<"taskFolders"> | undefined, startDate?: Date | undefined) => {
		try {
			const taskId = await addTaskItem({
				data: {
					title: "",
					isCompleted: view.kind === "systemFilter" && view.id === "completed",
					isFlagged: view.kind === "systemFilter" && view.id === "flagged",
					isSomeday: view.kind === "systemFilter" && view.id === "someday",
					startDate: startDate ? toBigInt(startDate) : view.kind === "systemFilter" && (view.id === "today" || view.id === "schedule") ? toBigInt(today()) : undefined,
				},
				_parentUniverseId: view.kind === "universe" ? view.id : undefined,
				_parentProjectId: view.kind === "project" ? view.id : undefined,
				_parentTaskFolderId: taskFolder,
				_userId: Constants.DEBUG_USER_ID,
			});
			setSelectedTaskItem(taskId);
		} catch (e) {
			console.error("Failed to create task in stack:", e);
		}
	};
	const modifyTaskItem = async (
		taskId: Id<"taskItems">,
		modifications: TaskItemModifications,
	) => {
		try {
			await updateTaskItem({
				_taskId: taskId,
				modifications: modifications,
			});
		} catch (e) {
			console.error("Failed to update task:", e);
		}
	};
	const deleteTaskItem = async (taskId: Id<"taskItems">) => {
		try {
			await removeTaskItem({
				_taskId: taskId,
			});
		} catch (e) {
			console.error("Failed to delete task:", e);
		}
	};

	const createTaskFolder = async (view: TaskView) => {
		try {
			if (view.kind === "systemFilter")
				throw new Error("Cannot create folders in filter views");

			const taskFolderId = await addTaskFolder({
				data: {
					title: "New Folder",
				},
				_parentUniverseId: view.kind === "universe" ? view.id : undefined,
				_parentProjectId: view.kind === "project" ? view.id : undefined,
				_userId: Constants.DEBUG_USER_ID,
			});
		} catch (e) {
			console.error("Failed to create task folder in stack:", e);
		}
	};
	const modifyTaskFolder = async (
		taskFolderId: Id<"taskFolders">,
		modifications: TaskFolderModifications,
	) => {
		try {
			await updateTaskFolder({
				_taskFolderId: taskFolderId,
				modifications: modifications,
			});
		} catch (e) {
			console.error("Failed to update task folder:", e);
		}
	};
	const deleteTaskFolder = async (taskFolderId: Id<"taskFolders">) => {
		try {
			await removeTaskFolder({
				_taskFolderId: taskFolderId,
			});
		} catch (e) {
			console.error("Failed to delete task folder:", e);
		}
	};

	const createUniverse = async (title = "New universe", desc = "") => {
		try {
			const universeId = await addUniverse({
				data: {
					title: title,
					description: desc,

					iconName: "",
					color: Constants.Colors.DEFAULT,
				},
				_userId: Constants.DEBUG_USER_ID,
			});
			setSelectedViewId(universeId);
		} catch (e) {
			console.error("Failed to create universe:", e);
		}
	};
	const modifyUniverse = async (
		universeId: Id<"universes">,
		modifications: UniverseModifications,
	) => {
		try {
			await updateUniverse({
				_universeId: universeId,
				modifications: modifications,
			});
		} catch (e) {
			console.error("Failed to update universe:", e);
		}
	};
	const deleteUniverse = async (universeId: Id<"universes">) => {
		// FIXME: Deleting a universe does not delete its projects or tasks for data safety.
		try {
			if (allUniverses) {
				const universe = withUniverse(universeId);
				if (!universe) throw new Error("Universe not found");
				const idx = allUniverses.indexOf(universe);
				const nextIdx = Math.min(allUniverses.length - 2, idx + 1);

				if (nextIdx >= 0) {
					const nextSelectedUniverse = allUniverses[nextIdx];
					setSelectedViewId(nextSelectedUniverse._id);
				}
			}

			await removeUniverse({
				_universeId: universeId,
			});
		} catch (e) {
			console.error("Failed to delete universe:", e);
		}
	};

	const createProject = async (universeId: Id<"universes">, title = "New project", desc = "") => {
		try {
			const projectId = await addProject({
				data: {
					title: title,
					description: desc,

					iconName: "",
					color: Constants.Colors.DEFAULT,
				},
				_parentUniverseId: universeId,
				_userId: Constants.DEBUG_USER_ID,
			});
			setSelectedViewId(projectId);
		} catch (e) {
			console.error("Failed to create project:", e);
		}
	};
	const modifyProject = async (
		projectId: Id<"projects">,
		modifications: ProjectModifications,
	) => {
		try {
			await updateProject({
				_projectId: projectId,
				modifications: modifications,
			});
		} catch (e) {
			console.error("Failed to update project:", e);
		}
	};
	const deleteProject = async (projectId: Id<"projects">) => {
		// FIXME: Note: Deleting a project does not delete its tasks for data safety.

		try {
			await removeProject({
				_projectId: projectId,
			});
		} catch (e) {
			console.error("Failed to delete project:", e);
		}
	};

	const dragDropHandler = (_source: Draggable, _target: Droppable) => {
		const source = parseDragId(_source.id.toString());
		const target = parseDropId(_target.id.toString());

		if (source.kind === "taskItem") {
			switch (target.kind ?? "") {
				case "taskFolder":
					modifyTaskItem(source.id as Id<"taskItems">, {
						parentTaskFolder: target.id as Id<"taskFolders">,
					});
					break;
				case "noTaskFolder":
					modifyTaskItem(source.id as Id<"taskItems">, {
						parentTaskFolder: null,
					});
					break;
				case "systemFilter":
					break;
				case "project":
					modifyTaskItem(source.id as Id<"taskItems">, {
						parentProject: target.id as Id<"projects">,
						parentTaskFolder: null,
					});
					break;
				case "universe":
					modifyTaskItem(source.id as Id<"taskItems">, {
						parentUniverse: target.id as Id<"universes">,
						parentProject: null,
						parentTaskFolder: null,
					});
					break;
				case "dateZone": // set start date
					if (target.additional === null) break;
					console.log(target);
					modifyTaskItem(source.id as Id<"taskItems">, {
						startDate: toBigInt(parseISO(target.additional)),
					});
					break;
			}
		} else if (source.kind === "deadline") {
			switch (target.kind) {
				case "dateZone": // set deadline
					if (target.additional === null) break;
					modifyTaskItem(source.id as Id<"taskItems">, {
						deadline: toBigInt(parseISO(target.additional)),
					});
					break;
			}
		}
	};

	// Render
	if (
		allUniverses === undefined ||
		allProjects === undefined ||
		allTaskFolders === undefined ||
		allTaskItems === undefined
	) {
		return (
			<div className="flex flex-row gap-2 items-center justify-center w-screen h-screen bg-slate-900">
				<Spinner />
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<UniversalContext.Provider value={{
			allTaskItems: allTaskItems,
			allTaskFolders: allTaskFolders,
			allProjects: allProjects,
			allUniverses: allUniverses,

			getView: (viewId: ViewId) => getViewFromId(viewId, allUniverses, allProjects),
			getTaskItem: withTaskItem,
			getTaskfolder: withTaskFolder,
			getProject: withProject,
			getUniverse: withUniverse,

			selectedTaskItemId: selectedTaskItem,
			navigateToTaskItem: navigateToTaskItem,

			selectedViewId: selectedViewId,
			navigateToView: (viewId: ViewId) => setSelectedViewId(viewId),
		}}>
			<DragDropProvider onDragEnd={(event) => {
				if (event.canceled) return;
				const { source, target } = event.operation;
				if (!source || !target) return;
				dragDropHandler(source, target);
			}}>
				<IconsProvider icons={TablerIcons}>
					{/*<DragOverlay*/}
					{/*	tag="div"*/}
					{/*	className="px-4 py-2 bg-slate-800 rounded-lg cursor-grabbing border border-slate-700 shadow-2xl"*/}
					{/*	dropAnimation={null}*/}
					{/*>*/}
					{/*	{(source) => {*/}
					{/*		// 1. Check if source exists*/}
					{/*		if (!source) return null;*/}

					{/*		// 2. Access data safely.*/}
					{/*		// dnd-kit/react puts your custom data in source.data*/}
					{/*		const id = source.id;*/}
					{/*		const type = source.type*/}

					{/*		if (type === "taskItem") {*/}
					{/*			const item = withTaskItem(id as Id<"taskItems">);*/}
					{/*			if (!item) return;*/}

					{/*			return (*/}
					{/*				<>{item.title || "Untitled Task"}</>*/}
					{/*			);*/}
					{/*		}*/}

					{/*		return null;*/}
					{/*	}}*/}
					{/*</DragOverlay>*/}

					<div className="w-screen h-screen">
						<div className="flex flex-row gap-0">
							<Sidebar
								systemSections={[
									{ kind: "data", view: Constants.FilterViews.INBOX },
									{ kind: "spacer" },
									{ kind: "data", view: Constants.FilterViews.TODAY },
									{ kind: "data", view: Constants.FilterViews.SCHEDULE, },
									{ kind: "data", view: Constants.FilterViews.EVERYTHING },
									{ kind: "data", view: Constants.FilterViews.FLAGGED, },
									{ kind: "data", view: Constants.FilterViews.SOMEDAY, },
									{ kind: "spacer" },
									{ kind: "data", view: Constants.FilterViews.COMPLETED, },
								]}
								userSections={viewHierarchy}
								universeActions={{
									create: createUniverse,
									modify: null,
									delete: deleteUniverse,
								}}
								projectActions={{
									create: createProject,
									modify: null,
									delete: deleteProject,
								}}
							/>

							{taskItemsForView !== undefined && taskFoldersForView !== undefined ?
								<div className="flex flex-col w-full h-screen">
									<div className="flex-1 flex overflow-auto">
										<MainView
											options={
												selectedView.kind === "systemFilter" ?
													{
														kind: "systemFilter",
														view: selectedView,
													}
												: selectedView.kind === "universe" ?
													{
														kind: "universe",
														view: selectedView,
														thisActions: {
															create: null,
															modify: (mods: UniverseModifications) => modifyUniverse(selectedView.id, mods),
															delete: () => deleteUniverse(selectedView.id)
														},
													}
												:	{
														kind: "project",
														view: selectedView,
														deadline: toDateOrUndefined(
															withProject(selectedView.id)?.deadline,
														),
														thisActions: {
															create: null,
															modify: (mods: ProjectModifications) => modifyProject(selectedView.id, mods),
															delete: () => deleteProject(selectedView.id),
														}
													}

											}

											taskItemsForView={taskItemsForView}
											taskFoldersForView={taskFoldersForView}

											taskItemActions={{
												create: (taskFolderId?: Id<"taskFolders"> | undefined, startDate?: Date | undefined) => createTaskItem(selectedView, taskFolderId, startDate),
												modify: modifyTaskItem,
												delete: null,
											}}
											taskFolderActions={{
												create: null,
												modify: modifyTaskFolder,
												delete: deleteTaskFolder,
											}}
										/>
									</div>
									<div className="shrink-0">
										<Actionbar
											universes={allUniverses}
											projects={allProjects}
											taskFolders={taskFoldersForView}
											isFilterView={selectedView.kind === "systemFilter"}
											isTaskItemSelected={selectedTaskItem !== null}

											taskItemActions={{
												create: () => createTaskItem(selectedView),
												modify: null,
												delete: null
											}}
											taskFolderActions={{
												create: () => createTaskFolder(selectedView),
												modify: null,
												delete: null
											}}
											selectedTaskItemActions={{
												create: null,
												modify: (mods: TaskItemModifications) => {
													if (selectedTaskItem !== null)
														return modifyTaskItem(selectedTaskItem, mods);
													return Promise.reject();
												},
												delete: () => {
													if (selectedTaskItem !== null) {
														setSelectedTaskItem(null);
														return deleteTaskItem(selectedTaskItem);
													}
													return Promise.reject();
												}
											}}
										/>
									</div>
								</div>
							:	<div className="flex-1 bg-slate-900" />}
						</div>
					</div>
				</IconsProvider>
			</DragDropProvider>
		</UniversalContext.Provider>
	);
}
