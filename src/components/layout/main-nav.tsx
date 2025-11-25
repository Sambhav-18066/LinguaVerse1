
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  FlaskConical,
  Bot,
  Users,
  BrainCircuit,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import React from 'react';

const menuItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Conversation',
    icon: MessageCircle,
    subItems: [
      {
        href: '/conversation/agentic',
        label: 'Agentic AI',
        icon: BrainCircuit,
      },
      {
        href: '/conversation/non-agentic',
        label: 'Non-Agentic AI',
        icon: Bot,
      },
      {
        href: '/conversation/peer',
        label: 'Peer-to-Peer',
        icon: Users,
      },
    ],
  },
  {
    href: '/assessment',
    label: 'Assessment',
    icon: FileText,
  },
  {
    href: '/how-to-use',
    label: 'How to Use',
    icon: HelpCircle,
  },
  {
    href: '/researcher',
    label: 'Researcher Panel',
    icon: FlaskConical,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const [isConversationOpen, setIsConversationOpen] = React.useState(
    pathname.startsWith('/conversation')
  );

  return (
    <nav className="p-2">
      <SidebarMenu>
        {menuItems.map((item, index) =>
          item.subItems ? (
            <Collapsible key={index} open={isConversationOpen} onOpenChange={setIsConversationOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      variant="default"
                      className="justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isConversationOpen && 'rotate-180'
                        )}
                      />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.href}>
                      <Link href={subItem.href}
                        className={cn(
                          'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
                          'text-sm',
                          'group-data-[collapsible=icon]:hidden',
                          pathname === subItem.href && 'bg-sidebar-accent text-sidebar-accent-foreground'
                        )}
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.label}</span>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton isActive={pathname === item.href}>
                  <>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </nav>
  );
}
