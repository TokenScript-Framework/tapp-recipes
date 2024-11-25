import React from "react"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Menu } from 'lucide-react'
import { SidebarContent } from "./sidebar-content"

export const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  return (
    <aside className={`hidden lg:block bg-white border-r transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4">
        <Button variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full justify-start">
          <Menu className="h-5 w-5 mr-2" />
          {isSidebarOpen && <span>Menu</span>}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-185px)]">
        <SidebarContent isOpen={isSidebarOpen} />
      </ScrollArea>
    </aside>

  )
}