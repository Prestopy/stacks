import RichIcon from "@/app/Components/RichIcon";
import { ReactNode } from "react";
import { IconData } from "@/app/util/types/baseTypes";

interface IconLabel {
	iconData: IconData;
	size: number;

	className?: string;
	children: ReactNode;
}
export default function LabelWithIcon({ iconData, className, size, children }: IconLabel) {
	return (
		<span className={"flex flex-row gap-1 items-center " + className}>
			<RichIcon iconData={iconData} size={size} />
			{children}
		</span>
	)
}
