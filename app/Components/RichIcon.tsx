import { IconData } from "@/app/util/types";
import { Icon, IconsName } from "tabler-dynamic-icon";

interface RichIconProps {
	iconData: IconData;
	size: number;
}
export default function RichIcon({ iconData, size }: RichIconProps) {
	if (Object.values(IconsName as never).includes(iconData.name)) {
		return (
			<Icon
				name={iconData.name as keyof typeof IconsName}
				size={size}
				color={iconData.color}
			/>
		);
	} else {
		// Fallback icon if the provided name is not found
		return (
			<Icon
				name="IconSquareDotFilled"
				size={size}
				color={iconData.color}
			/>
		);
	}
}
