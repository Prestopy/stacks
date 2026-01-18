"use client";

import Sidebar from "@/app/Components/Sidebar";
import MainView from "@/app/MainView";
import { useMemo, useState } from "react";
import {
	getViewFromId,
	ProjectModifications,
	TaskFolderModifications,
	TaskItemModifications,
	TaskView,
	toProjectView,
	toUniverseView,
	UniverseModifications,
	ViewId,
} from "@/app/util/types";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { filterTaskFolders, filterTaskItems } from "@/app/util/utilities";
import Actionbar from "@/app/Components/Actionbar";

import { IconsProvider } from "tabler-dynamic-icon";
import * as TablerIcons from "@tabler/icons-react";
import Constants from "@/app/util/constants";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
	// Queries
	const allUniverses = useQuery(api.universes.get);
	const allProjects = useQuery(api.projects.get);
	const allTaskFolders = useQuery(api.taskFolders.get);

	const allTaskItems: Doc<"taskItems">[] | undefined = useQuery(
		api.taskItems.get,
	);

	// State
	const [selectedViewId, setSelectedViewId] = useState<ViewId>(
		Constants.FilterViews.INBOX.id,
	);
	const [selectedTaskItem, setSelectedTaskItem] =
		useState<Id<"taskItems"> | null>(null);

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
		if (
			selectedView.kind === "universe" ||
			selectedView.kind === "project"
		) {
			return filterTaskFolders(allTaskFolders ?? [], selectedView);
		} else {
			return [];
		}
	}, [allTaskFolders, selectedView]);

	// Mutations
	const addTaskItem = useMutation(api.taskItems.createTaskItem);
	// https://docs.convex.dev/client/react/optimistic-updates
	const updateTaskItem = useMutation(
		api.taskItems.updateTaskItem,
	).withOptimisticUpdate((localStore, args) => {
		const { _taskId, modifications } = args;
		const currentValue = localStore.getQuery(api.taskItems.get);
		if (!currentValue) return;

		const updatedValue = currentValue.map((taskItem) => {
			if (taskItem._id.toString() === _taskId.toString()) {
				const serializedModifications = { ...modifications };
				for (const key in serializedModifications) {
					if (
						serializedModifications[
							key as keyof typeof serializedModifications
						] === null
					) {
						serializedModifications[
							key as keyof typeof serializedModifications
						] = undefined;
					}
				}
				return { ...taskItem, ...serializedModifications };
			}
			return taskItem;
		});

		// @ts-expect-error - the updated values already conform to that type (the mapping thur keys)
		localStore.setQuery(api.taskItems.get, {}, updatedValue);
	});
	const removeTaskItem = useMutation(
		api.taskItems.deleteTaskItem,
	).withOptimisticUpdate((localStore, args) => {
		const { _taskId } = args;
		const currentValue = localStore.getQuery(api.taskItems.get);
		if (!currentValue) return;

		const updatedValue = currentValue.filter(
			(taskItem) => taskItem._id.toString() !== _taskId.toString(),
		);

		localStore.setQuery(api.taskItems.get, {}, updatedValue);
	});

	const addTaskFolder = useMutation(api.taskFolders.createTaskFolder);
	const updateTaskFolder = useMutation(
		api.taskFolders.updateTaskFolder,
	).withOptimisticUpdate((localStore, args) => {
		const { _taskFolderId, modifications } = args;
		const currentValue = localStore.getQuery(api.taskFolders.get);
		if (!currentValue) return;

		const updatedValue = currentValue.map((taskFolder) => {
			if (taskFolder._id.toString() === _taskFolderId.toString()) {
				const serializedModifications = { ...modifications };
				for (const key in serializedModifications) {
					if (
						serializedModifications[
							key as keyof typeof serializedModifications
						] === null
					) {
						serializedModifications[
							key as keyof typeof serializedModifications
						] = undefined;
					}
				}
				return { ...taskFolder, ...serializedModifications };
			}
			return taskFolder;
		});

		// @ts-expect-error - the updated values already conform to that type (the mapping thru keys)
		localStore.setQuery(api.taskFolders.get, {}, updatedValue);
	});
	const removeTaskFolder = useMutation(
		api.taskFolders.deleteTaskFolder,
	).withOptimisticUpdate((localStore, args) => {
		const { _taskFolderId } = args;
		const currentValue = localStore.getQuery(api.taskFolders.get);
		if (!currentValue) return;

		const updatedValue = currentValue.filter(
			(taskFolder) =>
				taskFolder._id.toString() !== _taskFolderId.toString(),
		);

		localStore.setQuery(api.taskFolders.get, {}, updatedValue);
	});

	const addUniverse = useMutation(api.universes.createUniverse);
	const updateUniverse = useMutation(
		api.universes.updateUniverse,
	).withOptimisticUpdate((localStore, args) => {
		const { _universeId, modifications } = args;
		const currentValue = localStore.getQuery(api.universes.get);
		if (!currentValue) return;

		const updatedValue = currentValue.map((universe) => {
			if (universe._id.toString() === _universeId.toString()) {
				const serializedModifications = { ...modifications };
				for (const key in serializedModifications) {
					if (
						serializedModifications[
							key as keyof typeof serializedModifications
						] === null
					) {
						serializedModifications[
							key as keyof typeof serializedModifications
						] = undefined;
					}
				}
				return { ...universe, ...serializedModifications };
			}
			return universe;
		});

		// @ts-expect-error - the updated values already conform to that type (the mapping thru keys)
		localStore.setQuery(api.universes.get, {}, updatedValue);
	});
	const removeUniverse = useMutation(
		api.universes.deleteUniverse,
	).withOptimisticUpdate((localStore, args) => {
		const { _universeId } = args;
		const currentValue = localStore.getQuery(api.universes.get);
		if (!currentValue) return;

		const updatedValue = currentValue.filter(
			(universe) => universe._id.toString() !== _universeId.toString(),
		);

		localStore.setQuery(api.universes.get, {}, updatedValue);
	});

	const addProject = useMutation(api.projects.createProject);
	const updateProject = useMutation(
		api.projects.updateProject,
	).withOptimisticUpdate((localStore, args) => {
		const { _projectId, modifications } = args;
		const currentValue = localStore.getQuery(api.projects.get);
		if (!currentValue) return;

		const updatedValue = currentValue.map((project) => {
			if (project._id.toString() === _projectId.toString()) {
				const serializedModifications = { ...modifications };
				for (const key in serializedModifications) {
					if (
						serializedModifications[
							key as keyof typeof serializedModifications
						] === null
					) {
						serializedModifications[
							key as keyof typeof serializedModifications
						] = undefined;
					}
				}
				return { ...project, ...serializedModifications };
			}
			return project;
		});

		// @ts-expect-error - the updated values already conform to that type (the mapping thru keys)
		localStore.setQuery(api.projects.get, {}, updatedValue);
	});
	const removeProject = useMutation(
		api.projects.deleteProject,
	).withOptimisticUpdate((localStore, args) => {
		const { _projectId } = args;
		const currentValue = localStore.getQuery(api.projects.get);
		if (!currentValue) return;

		const updatedValue = currentValue.filter(
			(project) => project._id.toString() !== _projectId.toString(),
		);

		localStore.setQuery(api.projects.get, {}, updatedValue);
	});

	// Handlers
	const createTaskItem = async (view: TaskView) => {
		try {
			const taskId = await addTaskItem({
				data: {
					title: "",
					isCompleted:
						view.kind === "system_filter" &&
						view.id === "completed",
					isFlagged:
						view.kind === "system_filter" && view.id === "flagged",
					isSomeday:
						view.kind === "system_filter" && view.id === "someday",
				},
				_parentUniverseId:
					view.kind === "universe" ? view.id : undefined,
				_parentProjectId: view.kind === "project" ? view.id : undefined,
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
			const taskFolderId = await addTaskFolder({
				data: {
					title: "New Folder",
				},
				_parentUniverseId:
					view.kind === "universe" ? view.id : undefined,
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
				const universe = allUniverses.find(
					(u) => u._id.toString() === universeId.toString(),
				);
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
		<IconsProvider icons={TablerIcons}>
			<div className="w-screen h-screen">
				<div className="flex flex-row gap-0">
					<Sidebar
						systemBlocks={[
							{ kind: "data", view: Constants.FilterViews.INBOX },
							{ kind: "spacer" },
							{ kind: "data", view: Constants.FilterViews.TODAY },
							{ kind: "data", view: Constants.FilterViews.EVERYTHING },
							{
								kind: "data",
								view: Constants.FilterViews.FLAGGED,
							},
							{
								kind: "data",
								view: Constants.FilterViews.SCHEDULE,
							},
							{
								kind: "data",
								view: Constants.FilterViews.SOMEDAY,
							},
							{ kind: "spacer" },
							{
								kind: "data",
								view: Constants.FilterViews.COMPLETED,
							},
						]}
						userBlocks={allUniverses.map((universe) => {
							if (
								allProjects.some(
									(project) =>
										project.parentUniverse.toString() ===
										universe._id.toString(),
								)
							) {
								return {
									kind: "data" as const,
									view: toUniverseView(universe),
									childData: allProjects
										.filter(
											(project) =>
												project.parentUniverse.toString() ===
												universe._id.toString(),
										)
										.map((project) => ({
											kind: "data" as const,
											view: toProjectView(project),
										})),
								};
							} else {
								return {
									kind: "data" as const,
									view: toUniverseView(universe),
								};
							}
						})}
						selectedView={selectedView}
						setSelectedViewId={setSelectedViewId}
						createUniverse={createUniverse}
						createProject={(universeId) =>
							createProject(universeId)
						}
						deleteUniverse={deleteUniverse}
						deleteProject={deleteProject}
					/>

					{(
						taskItemsForView !== undefined &&
						taskFoldersForView !== undefined
					) ?
						<div className="flex flex-col w-full h-screen">
							<div className="h-full overflow-auto">
								<MainView
									options={
										selectedView.kind === "system_filter" ?
											{
												kind: "system_filter",
												view: selectedView,
											}
										: selectedView.kind === "universe" ?
											{
												kind: "universe",
												view: selectedView,
												modifyThis: (
													mods: UniverseModifications,
												) =>
													modifyUniverse(
														selectedView.id,
														mods,
													),
												deleteThis: () =>
													deleteUniverse(
														selectedView.id,
													),
											}
										:	{
												kind: "project",
												view: selectedView,
												modifyThis: (
													mods: ProjectModifications,
												) =>
													modifyProject(
														selectedView.id,
														mods,
													),
												deleteThis: () =>
													deleteProject(
														selectedView.id,
													),
											}
									}
									taskFolders={taskFoldersForView}
									taskItems={taskItemsForView}
									selectedTaskItem={selectedTaskItem}
									setSelectedTaskItem={setSelectedTaskItem}

									modifyTaskItem={modifyTaskItem}

									modifyTaskFolder={modifyTaskFolder}
									deleteTaskFolder={deleteTaskFolder}
								/>
							</div>
							<Actionbar
								taskFolders={taskFoldersForView}
								projects={allProjects}
								universes={allUniverses}

								isTaskItemSelected={selectedTaskItem !== null}
								createTaskItem={() =>
									createTaskItem(selectedView)
								}
								createTaskFolder={() =>
									createTaskFolder(selectedView)
								}

								modifySelectedTaskItem={(mods: TaskItemModifications) => {
									if (selectedTaskItem !== null) {
										return modifyTaskItem(
											selectedTaskItem,
											mods,
										);
									}
								}}
								deleteSelectedTaskItem={() => {
									let promise = Promise.resolve();
									if (selectedTaskItem !== null) {
										promise =
											deleteTaskItem(selectedTaskItem);
										setSelectedTaskItem(null);
									}

									return promise;
								}}
							/>
						</div>
					:	<div className="flex-1 bg-slate-900" />}
				</div>
			</div>
		</IconsProvider>
	);
}
