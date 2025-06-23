import { useState, lazy, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
const MainContent = lazy(() => import("@/components/MainContent"));

function Layout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full flex bg-gray-200 dark:bg-gray-900">
      <Sidebar setOpen={setOpen} open={open} />

      <div
        className={`flex-1 relative flex flex-col transition-all duration-300 ease-in-out items-center min-h-screen ${
          open ? "md:ml-64" : "ml-0 pr-1"
        }`}
      >
        <button
          className={`fixed z-40 opacity-50 border-r border-b md:w-auto md:h-auto hover:opacity-80 transition-all duration-300 ease-in-out bg-gray-200 dark:bg-gray-900 shadow-md flex justify-between items-center overflow-hidden rounded-br-xl rounded-tr-xl ${
            open ? "left-64 w-full h-full" : "left-0"
          }`}
          onClick={() => setOpen(!open)}
        >
          <span className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 mb-auto transition-colors duration-300">
            <img
              className={`transition-transform duration-300 ease-in-out transform ${
                open ? "rotate-0" : "rotate-180"
              }`}
              src="https://ttalesinteractive.com/graphics/larrow.png"
              width="25"
              height="25"
              alt="Menu"
            />
          </span>
        </button>

        <div className="w-full flex flex-col items-center justify-center flex-1">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400">
                Loading...
              </div>
            }
          >
            <MainContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Layout;
