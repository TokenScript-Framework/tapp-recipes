import React from "react"

import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { Aperture, House, LayoutDashboard, Users } from "lucide-react"

const menuItems = [
  {
    name: 'Home',
    icon: <House className="h-5 w-5" />,
    href: "/"
  },
  {
    name: 'Collection',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/collection"
  },
  {
    name: 'Content',
    icon: <Aperture className="h-5 w-5" />,
    href: "/content"
  },
  {
    name: 'Membership',
    icon: <Users className="h-5 w-5" />,
    href: "/membership"
  }
]

interface SidebarContentProps {
  isOpen?: boolean
  onSelect?: () => void;
}
export const SidebarContent = ({ onSelect, isOpen = true }: SidebarContentProps) => {
  const router = useRouter()

  const handleItemClick = (href: string) => {
    // 原有的点击处理逻辑
    // ...
    router.push(href)
    onSelect?.();
  }

  return (
    <ul className="space-y-2 px-2">
      {menuItems.map((item) => (
        <li key={item.name}>
          <Button
            variant="ghost"
            className={`w-full ${isOpen ? 'justify-start' : 'justify-center'} ${isOpen ? 'px-4' : 'px-2'}`}
            onClick={() => handleItemClick(item.href)}
          >
            {item.icon}
            {isOpen && (
              <>
                <span className="ml-3">{item.name}</span>
              </>
            )}
          </Button>

        </li>
      ))}
    </ul>
  )
}