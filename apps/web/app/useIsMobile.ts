import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 640; // Tailwind's sm breakpoint

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState(
		true
	);

	useEffect(() => {
		if (!window) return;
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, []);

	return isMobile;
}
