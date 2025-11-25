'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
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
                      <Link href={subItem.href} passHref asChild>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.href}
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.label}</span>
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} asChild>
                <SidebarMenuButton isActive={pathname === item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </nav>
  );
}
