import RichIcon from "@/app/Components/RichIcon";
import * as React from "react";
import { IconData } from "@/app/util/types/baseTypes";

interface InputTagProps {
	open: boolean;
	icon: IconData;
	isUnset: boolean;
	children: React.ReactNode;
}
export default function InputTag({
	open,
	icon,
	isUnset,
	children,
}: InputTagProps) {
	return (
		<div
			className={`flex flex-row gap-2 h-6 border px-2 text-sm items-center ${isUnset ? "text-slate-400" : ""} ${open ? "border-slate-500" : "border-transparent"} cursor-pointer rounded-md w-fit`}
		>
			<RichIcon iconData={icon} size={16} />
			{children}
		</div>
	);
}
