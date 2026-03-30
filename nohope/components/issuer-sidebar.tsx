"use client";

import Link from "next/link";
import { LayoutGrid, ShieldCheck, Settings, User2, Album, BookOpenCheck, PanelsTopLeft } from "lucide-react";
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

export default function IssuerSidebar() {
  const path = usePathname();
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
              <SidebarMenuButton asChild isActive={path === "/issuer/dashboard"}>
                <Link href="/issuer/dashboard">
                  <PanelsTopLeft className="size-4" />
                  Bảng điều khiển
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={path === "/issuer/issue"}>
                <Link href="/issuer/issue">
                  <Album className="size-4" />
                  Phát hành
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={path === "/issuer/certificates"}>
                <Link href="/issuer/certificates">
                  <BookOpenCheck className="size-4" />
                  Chứng chỉ
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={path === "/issuer/profile"}>
              <Link href="/issuer/profile">
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
