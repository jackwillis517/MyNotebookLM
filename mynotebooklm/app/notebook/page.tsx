import LeftPanel from "@/components/LeftPanel";
import CenterPanel from "@/components/CenterPanel";
import RightPanel from "@/components/RightPanel";
import { ChatProvider } from "@/contexts/ChatProvider";

const Notebook = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-[1800px] mx-auto h-[calc(100vh-2rem)]">
          <div className="grid grid-cols-6 gap-4 h-full">
            {/* Left Panel - 1/4 width */}
            <div className="col-span-1">
              <LeftPanel />
            </div>

            {/* Center Panel - 1/2 width */}
            <div className="col-span-3 h-full">
              <CenterPanel />
            </div>

            {/* Right Panel - 1/4 width */}
            <div className="col-span-2">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Notebook;
