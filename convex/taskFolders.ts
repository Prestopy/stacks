import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("taskFolders").collect();
	},
});

export const createTaskFolder = mutation({
	args: {
		data: v.object({
			title: v.string(),
			iconName: v.optional(v.string()),
			color: v.optional(v.string()),
			description: v.optional(v.string()),

			// Relations
			// parentUniverse: v.optional(v.id("stacks")),
			//
			// parentTaskItem: v.optional(v.id("taskItems")),
			// childTaskItems: v.optional(v.array(v.id("taskItems"))),
		}),
		_parentUniverseId: v.optional(v.id("universes")),
		_parentProjectId: v.optional(v.id("projects")),
		_userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		if (args._parentProjectId && args._parentUniverseId) {
			throw new Error(
				"only one can be provided: _parentUniverseId or _parentProjectId.",
			);
		}
		if (!args._parentProjectId && !args._parentUniverseId) {
			throw new Error(
				"one must be provided: _parentUniverseId or _parentProjectId.",
			);
		}

		if (args._parentProjectId) {
			const project = await ctx.db.get("projects", args._parentProjectId);
			if (!project) throw new Error("Project not found");

			return await ctx.db.insert("taskFolders", {
				...args.data,
				parentUniverse: project.parentUniverse,
				parentProject: args._parentProjectId,
				user: args._userId,
			});
		} else if (args._parentUniverseId) {
			return await ctx.db.insert("taskFolders", {
				...args.data,
				parentUniverse: args._parentUniverseId,
				user: args._userId,
			});
		} else {
			throw new Error("unreachable");
		}
	},
});

export const updateTaskFolder = mutation({
	args: {
		_taskFolderId: v.id("taskFolders"),
		modifications: v.object({
			title: v.optional(v.string()),
			description: v.optional(v.nullable(v.string())),

			iconName: v.optional(v.nullable(v.string())),
			color: v.optional(v.nullable(v.string())),

			parentUniverse: v.optional(v.id("universes")),
			parentProject: v.optional(v.nullable(v.id("projects"))),

			// user: v.id("users"),
		}),
	},
	handler: async (ctx, args) => {
		try {
			if (args.modifications.parentProject && args.modifications.parentUniverse) {
				throw new Error(
					"only one can be provided: _parentUniverseId or _parentProjectId.",
				);
			}

			if (args.modifications.parentProject) {
				const project = await ctx.db.get(
					"projects",
					args.modifications.parentProject,
				);
				if (!project) throw new Error("Project not found");

				args.modifications.parentUniverse = project.parentUniverse;
			}

			for (const key in args.modifications) {
				if (
					args.modifications[
						key as keyof typeof args.modifications
					] === null
				) {
					args.modifications[key as keyof typeof args.modifications] =
						undefined;
				}
			}

			return await ctx.db.patch(
				"taskFolders",
				args._taskFolderId,
				// @ts-expect-error - null to undefined conversion
				args.modifications,
			);
		} catch (e) {
			throw new Error("Failed to update task folder: " + e);
		}
	},
});

export const deleteTaskFolder = mutation({
	args: {
		_taskFolderId: v.id("taskFolders"),
	},
	handler: async (ctx, args) => {
		try {
			// Loop thru all tasks with this folder as parent and set their parent to null
			const tasksInFolder = await ctx.db
				.query("taskItems")
				.withIndex("by_parentTaskFolder", (q) =>
					q.eq("parentTaskFolder", args._taskFolderId),
				)
				.collect();

			await Promise.all(tasksInFolder.map((task) => {
				return ctx.db.patch("taskItems", task._id, {
					parentTaskFolder: undefined,
				});
			}));

			return await ctx.db.delete("taskFolders", args._taskFolderId);
		} catch (e) {
			throw new Error("Failed to delete task folder: " + e);
		}
	},
});
