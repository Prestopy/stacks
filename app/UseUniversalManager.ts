import { useContext } from "react";
import { UniversalContext } from "@/app/TheUniverseManager";

export function useUniversalState() {
	const context = useContext(UniversalContext);

	if (context === undefined) {
		throw new Error('useUniversalState must be used within a UniversalContext.Provider'); // Safety check
	}

	return context;
}
