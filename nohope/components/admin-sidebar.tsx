"use client";

import Link from "next/link";
import { LayoutGrid, ShieldCheck, Settings, User2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const path = usePathname();
  console.log(":::: path", path);
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <LayoutGrid className="size-5" />
          <span className="text-sm font-semibold">Bảng quản trị</span>
        </div>
        <SidebarInput placeholder="Tìm kiếm..." />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={path === "/admin/dashboard"}>
                <Link href="/admin/dashboard">
                  <ShieldCheck className="size-4" />
                  Bảng điều khiển
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={path === "/admin/issuers"}>
                <Link href="/admin/issuers">
                  <User2 className="size-4" />
                  Người phát hành
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={path === "/admin/settings"}>
                <Link href="/admin/settings">
                  <Settings className="size-4" />
                  Cài đặt
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={path === "/admin/profile"}>
              <Link href="/admin/profile">
                <User2 className="size-4" />
                Tài khoản
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
