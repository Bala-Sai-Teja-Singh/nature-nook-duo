'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LogOut, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/shared/molecules/modal';

/* ─── Types ─── */
export interface MobileSidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** If true, match pathname exactly instead of prefix-matching */
  exact?: boolean;
  /** Optional highlight variant (e.g. amber for "Admin Dashboard") */
  highlight?: 'amber';
}

export interface MobileSidebarSection {
  /** Optional section heading (e.g. "Your Account", "Management") */
  label?: string;
  items: MobileSidebarItem[];
}

export interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  sections: MobileSidebarSection[];
  /** Show the sign-out button at the bottom */
  showSignOut?: boolean;
  onSignOut?: () => void;
  /** Show the sign-in button instead (when not authenticated) */
  showSignIn?: boolean;
}

/* ─── Component ─── */
export function MobileSidebar({
  open,
  onClose,
  sections,
  showSignOut = false,
  onSignOut,
  showSignIn = false,
}: MobileSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      variant="side-drawer-left"
      noPadding
      title={
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-heading text-xl font-bold text-primary">
            Nature&apos;s Nook Duo
          </span>
        </div>
      }
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Navigation sections */}
        <div className="flex-1 py-4 space-y-1 px-3">
          {sections.map((section, sIdx) => (
            <div key={section.label ?? sIdx}>
              {/* Section label */}
              {section.label && (
                <div className="pt-4 pb-2 px-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </p>
                </div>
              )}

              {/* Links */}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);

                /* Amber-highlighted link (e.g. Admin Dashboard, View Storefront) */
                if (item.highlight === 'amber') {
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div className="flex items-center px-4 py-3 rounded-xl transition-colors text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-500 mt-2 font-medium">
                        <Icon className="mr-3 h-5 w-5" />
                        <span className="text-base">{item.label}</span>
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <div
                      className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span className="text-base">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        {(showSignOut || showSignIn) && (
          <div className="mt-auto pt-4 pb-4 border-t border-border px-5">
            {showSignOut && onSignOut && (
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}
            {showSignIn && (
              <Link href="/login" onClick={onClose}>
                <Button className="w-full rounded-full">Sign In</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
