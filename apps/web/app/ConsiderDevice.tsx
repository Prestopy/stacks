import {ReactNode, Ref, RefObject} from "react";
import {PanelImperativeHandle} from "react-resizable-panels";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {IconLayoutSidebarLeftExpand} from "@tabler/icons-react";

export default function ConsiderDevice(
	{isMobile, sidebar, showSidebar, sidebarPanelRef, sidebarCollapsed, setSidebarCollapsed, children}:
	{
		isMobile: boolean,
		sidebarPanelRef: RefObject<PanelImperativeHandle | null> | undefined,

		showSidebar: () => void,

		sidebarCollapsed: boolean,
		setSidebarCollapsed: (v: boolean) => void,
		sidebar: ReactNode,
		children: ReactNode
	}) {
	if (isMobile) {
		return (
			<>
				{
					sidebarCollapsed ? (
						<>
							<button
								className="absolute top-0 left-0 p-1 m-1 text-slate-400 hover:bg-slate-700 rounded transition-colors duration-200"
								onClick={showSidebar}
							>
								<IconLayoutSidebarLeftExpand />
							</button>
							{children}
						</>
					) : sidebar
				}
			</>
		)
	} else {
		return (
			<ResizablePanelGroup orientation="horizontal">
				<ResizablePanel
					collapsible
					panelRef={sidebarPanelRef}
					onResize={(e) => {
						setSidebarCollapsed(e.inPixels === 0);
					}}
					minSize={250}
					maxSize={500}
					defaultSize={isMobile ? "100%" : "25%"}
				>
					{sidebar}
				</ResizablePanel>

				{
					sidebarCollapsed && (
						<button
							className="absolute top-0 left-0 p-1 m-1 text-slate-400 hover:bg-slate-700 rounded transition-colors duration-200"
							onClick={showSidebar}
						>
							<IconLayoutSidebarLeftExpand />
						</button>
					)
				}

				<ResizableHandle withHandle/>

				<ResizablePanel defaultSize="75%">
					{children}
				</ResizablePanel>
			</ResizablePanelGroup>
		)
	}
}
