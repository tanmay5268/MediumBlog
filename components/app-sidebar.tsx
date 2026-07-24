"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, Settings2Icon, CircleHelpIcon, SearchIcon, CommandIcon, FileTextIcon } from "lucide-react"
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const data = {
    user: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      avatar: session?.user?.image ?? "",
    },
    navMain: [
      {
        title: "Home",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
      },
      {
        title: "profile",
        url: "/dashboard/profile",
        icon: <ListIcon />,
      },
      {
        title: "write",
        url: "/write",
        icon: <FileTextIcon />,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: <Settings2Icon />,
      },
      {
        title: "Get Help",
        url: "#",
        icon: <CircleHelpIcon />,
      },
      {
        title: "Search",
        url: "#",
        icon: <SearchIcon />,
      },
    ],
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">CodeLore</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
