import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Run with:
 * npx convex run seed
 */
export const seed = mutation(async ({ db }) => {
	// --------------------
	// USERS
	// --------------------
	const userId = await db.insert("users", {
		firstName: "Alex",
		lastName: "Johnson",
	});

	// --------------------
	// UNIVERSES
	// --------------------
	const workUniverseId = await db.insert("universes", {
		title: "Work",
		iconName: "briefcase",
		description: "Career, job, and professional growth",
		user: userId,
	});

	const lifeUniverseId = await db.insert("universes", {
		title: "Life",
		iconName: "home",
		description: "Personal life and wellbeing",
		user: userId,
	});

	// --------------------
	// PROJECTS (must belong to a universe)
	// --------------------
	const websiteProjectId = await db.insert("projects", {
		title: "Company Website Redesign",
		iconName: "layout",
		description: "Revamp landing page and branding",
		deadline: BigInt(Date.now() + 1000 * 60 * 60 * 24 * 30),
		parentUniverse: workUniverseId,
		user: userId,
	});

	const fitnessProjectId = await db.insert("projects", {
		title: "Get Fit",
		iconName: "dumbbell",
		description: "Health and fitness goals",
		parentUniverse: lifeUniverseId,
		user: userId,
	});

	// --------------------
	// FOLDERS
	// --------------------
	const backlogFolderId = await db.insert("taskFolders", {
		title: "Backlog",
		iconName: "inbox",
		description: "Unsorted tasks",
		parentUniverse: workUniverseId,
		user: userId,
	});

	const websiteFolderId = await db.insert("taskFolders", {
		title: "Website Tasks",
		iconName: "code",
		parentUniverse: workUniverseId,
		parentProject: websiteProjectId, // same universe ✔
		user: userId,
	});

	const fitnessFolderId = await db.insert("taskFolders", {
		title: "Workout Plan",
		iconName: "heart",
		parentUniverse: lifeUniverseId,
		parentProject: fitnessProjectId, // same universe ✔
		user: userId,
	});

	// --------------------
	// TASK ITEMS
	// --------------------

	// --- Universe-level tasks (no project)
	await db.insert("taskItems", {
		title: "Plan quarterly goals",
		isCompleted: false,
		isFlagged: true,
		isSomeday: false,
		parentUniverse: workUniverseId,
		user: userId,
	});

	await db.insert("taskItems", {
		title: "Meditate",
		note: "10 minutes in the morning",
		isCompleted: false,
		isFlagged: false,
		isSomeday: false,
		parentUniverse: lifeUniverseId,
		user: userId,
	});

	// --- Project tasks (must match universe)
	const designTaskId = await db.insert("taskItems", {
		title: "Design new homepage",
		isCompleted: false,
		isFlagged: true,
		isSomeday: false,
		deadline: BigInt(Date.now() + 1000 * 60 * 60 * 24 * 14),
		parentUniverse: workUniverseId,
		parentProject: websiteProjectId,
		user: userId,
	});

	await db.insert("taskItems", {
		title: "Implement responsive layout",
		isCompleted: false,
		isFlagged: false,
		isSomeday: false,
		parentUniverse: workUniverseId,
		parentProject: websiteProjectId,
		parentTaskItem: designTaskId, // subtask ✔
		user: userId,
	});

	await db.insert("taskItems", {
		title: "Create weekly workout schedule",
		isCompleted: true,
		isFlagged: false,
		isSomeday: false,
		parentUniverse: lifeUniverseId,
		parentProject: fitnessProjectId,
		user: userId,
	});

	// --- Someday task
	await db.insert("taskItems", {
		title: "Learn rock climbing",
		isCompleted: false,
		isFlagged: false,
		isSomeday: true,
		parentUniverse: lifeUniverseId,
		user: userId,
	});
});
