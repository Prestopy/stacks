"use client";

import Sidebar from "@/app/Components/Sidebar";
import StackView from "@/app/Components/StackView";
import {useState} from "react";
import {FILTER_VIEWS, TaskView} from "@/app/util/types";

export default function Home() {
	const [selectedView, setSelectedView] = useState<TaskView | null>(null);
	return (
		<div className="w-screen h-screen">
			<div className="flex flex-row gap-0">
				<Sidebar
					filterViews={
						[
							FILTER_VIEWS.INBOX,
							null, // spacing
							FILTER_VIEWS.TODAY,
							FILTER_VIEWS.FLAGGED,
							FILTER_VIEWS.SCHEDULE,
							FILTER_VIEWS.SOMEDAY,
							null, // spacing
							FILTER_VIEWS.COMPLETED,
						]
					}
					stackViews={[
						{
							isFilterView: false,
							id: "stack1",
							title: "My First Stack",
							icon: "🦆",
							description: "This is my first stack description.",
							layout: "list"
						}
					]}
					selectedView={selectedView}
					setSelectedView={setSelectedView}
				/>

				{
					selectedView !== null ? (
						<StackView
							view={selectedView}
							taskItems={[]}
							taskFolders={[]}
						/>
					) : (
						<p>loading...</p>
					)
				}
			</div>
		</div>
	);
}
