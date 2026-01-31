import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NodeViewContainerKind } from "@/app/util/types/baseTypes";

interface ViewDeleteDialogContentProps {
	kind: NodeViewContainerKind;
	deleteThis: () => void;
}
export default function ViewDeleteDialogContent({ kind, deleteThis}: ViewDeleteDialogContentProps) {
	return (
		<>
			<DialogHeader>
				<DialogTitle>Are you absolutely sure?</DialogTitle>
				<DialogDescription>
					This action cannot be undone. This will permanently delete
					this{" "}
					{kind === "universe" ?
						"universe and all its projects and tasks"
						:	"project and all of its tasks"}
					.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<DialogClose asChild>
					<Button variant="outline">Cancel</Button>
				</DialogClose>
				<DialogClose asChild>
					<Button
						onClick={() => {
							deleteThis();
						}}
						variant="destructive"
					>
						Delete
					</Button>
				</DialogClose>
			</DialogFooter>
		</>
	)
}
