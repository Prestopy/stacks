import ListLayout from "@/app/Components/ListLayout";
import {TaskView} from "@/app/util/types";

interface StackViewProps {
	view: TaskView;
	taskFolders: any[];
	taskItems: any[];
}
export default function StackView({ view, taskFolders, taskItems }: StackViewProps) {
	return (
		<div className="flex-1 flex flex-row justify-center p-4 pt-20 bg-slate-900">
			<div className="w-[720] h-full">
				<div>
					<h1 className="text-4xl font-bold">{view.icon} {view.title}</h1>
					<p className="text-slate-300">{view.description}</p>
				</div>

				<hr className="my-4 border-slate-700" />

				{
					view.layout === "list" ? (
						<ListLayout taskFolders={taskFolders} taskItems={taskItems} />
					) : (
						<div>Schedule View (to be implemented)</div>
					)
				}
			</div>
		</div>
	)
}