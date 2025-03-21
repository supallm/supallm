"use client";

import {
  BrainCircuit,
  ChevronUp,
  Home,
  KeyRoundIcon,
  User2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ChatFlowsRoute,
  CredentialsRoute,
  LogoutRoute,
  OverviewRoute,
} from "@/routes";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
// Menu items.
const items = [
  {
    title: "Overview",
    url: OverviewRoute.path(),
    icon: Home,
  },
  {
    title: "AI flows",
    url: ChatFlowsRoute.path(),
    icon: BrainCircuit,
  },
  {
    title: "Credentials",
    url: CredentialsRoute.path(),
    icon: KeyRoundIcon,
  },
  // {
  //   title: "Authentication",
  //   url: AuthenticationRoute.path(),
  //   icon: Users,
  // },
];

export function AppSidebar() {
  const router = useRouter();

  const signOut = async () => {
    router.push(LogoutRoute.path());
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Account
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span onClick={() => signOut()}>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
