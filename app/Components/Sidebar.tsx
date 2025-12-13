import {Property} from "csstype";
import {FilterView, StackView, TaskView} from "@/app/util/types";

interface SidebarProps {
	filterViews: (FilterView | null)[];
	stackViews: (StackView | null)[];

	selectedView: TaskView;
	setSelectedView: (view: TaskView) => void;
}

export default function Sidebar({ filterViews, stackViews, selectedView, setSelectedView }: SidebarProps) {
	return (
		<div className="w-72 font-bold text-slate-300 h-screen p-4 pt-8 bg-slate-800 border-r border-r-slate-700">
			{
				filterViews.map((view, i) => {
					if (view == null) return (
						<hr key={i} className="my-2 border-none" />
					)

					return (
						<button
							key={i}
							className="px-4 py-1 w-full text-left hover:bg-white/10 duration-100 rounded-lg"
							onClick={() => setSelectedView(view)}
						>{view.icon} {view.title}</button>
					)
				})
			}
			{
				stackViews.map((view, i) => {
					if (view == null) return (
						<hr key={i} className="my-2 border-none" />
					)

					return (
						<button
							key={i}
							className="px-4 py-1 w-full text-left hover:bg-white/10 duration-100 rounded-lg"
							onClick={() => setSelectedView(view)}
						>{view.icon} {view.title}</button>
					)
				})
			}
		</div>
	)
}