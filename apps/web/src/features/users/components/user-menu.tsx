"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@starter-saas/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@starter-saas/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@starter-saas/ui/sidebar";
import { ChevronsUpDown, Globe, LogOut, Moon, Palette, Settings, Sun, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { toast } from "sonner";
import { setLocale } from "@/actions/set-locale";
import { authClient } from "@/lib/auth/client";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import { LOCALES, type Locale, localeNames } from "@/lib/i18n";
import { logError } from "@/lib/sentry";
import { getInitials } from "@/lib/user-utils";

type UserMenuProps = {
  currentLocale: Locale;
};

export default function UserMenu({ currentLocale }: UserMenuProps) {
  const router = useRouter();
  const { t } = useLingui();
  const { data: user } = useQueryWithStatus(api.auth.getCurrentUser);
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(async () => {
      await setLocale(newLocale as Locale);
      router.refresh();
    });
  };

  if (!user) {
    return null;
  }

  const initials = getInitials(user.name);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            toast.success(t`Signed out successfully`);
          },
          onError: () => {
            toast.error(t`Failed to sign out. Please try again.`);
          },
        },
      });
    } catch (error) {
      logError(error, { feature: "users", action: "signOut" });
      toast.error(t`Failed to sign out. Please try again.`);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                data-testid="user-menu"
                size="lg"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={user.name} src={user.image ?? undefined} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuPositioner align="end" side="top" sideOffset={4}>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg">
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage alt={user.name} src={user.image ?? undefined} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  <Trans>Account</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  <Trans>Settings</Trans>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {/* Theme Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="mr-2 size-4" />
                    <Trans>Theme</Trans>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
                        <DropdownMenuRadioItem value="light">
                          <Sun className="mr-2 size-4" />
                          <Trans>Light</Trans>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                          <Moon className="mr-2 size-4" />
                          <Trans>Dark</Trans>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          <Palette className="mr-2 size-4" />
                          <Trans>System</Trans>
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* Language Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={isPending}>
                    <Globe className="mr-2 size-4" />
                    <Trans>Language</Trans>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        onValueChange={handleLocaleChange}
                        value={currentLocale}
                      >
                        {LOCALES.map((locale) => (
                          <DropdownMenuRadioItem key={locale} value={locale}>
                            {localeNames[locale]}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="sign-out-button" onClick={handleSignOut}>
                <LogOut className="mr-2 size-4" />
                <Trans>Sign out</Trans>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
