import InputTag from "@/app/Components/InputTag";
import { useState } from "react";
import Constants from "@/app/util/constants";

interface FlaggedInputTagProps {
	isFlagged: boolean;
	updateIsFlagged: (value: boolean) => void;
}
export default function FlaggedInputTag({
	isFlagged,
	updateIsFlagged,
}: FlaggedInputTagProps) {
	return (
		<button
			style={{
				color: Constants.Colors.FLAGGED_PURPLE,
			}}
			onClick={() => {
				updateIsFlagged(!isFlagged);
			}}
		>
			<InputTag
				open={false}
				icon={
					!isFlagged ?
						Constants.Icons.UNFLAGGED
					:	Constants.Icons.FLAGGED
				}
				isUnset={!isFlagged}
			>
				<p className="">{!isFlagged ? "Unflagged" : "Flagged"}</p>
			</InputTag>
		</button>
	);
}
