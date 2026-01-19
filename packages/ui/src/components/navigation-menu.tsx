import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cn } from "@starter-saas/ui/utils";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

function NavigationMenu({ className, children, ...props }: NavigationMenuPrimitive.Root.Props) {
  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      data-slot="navigation-menu"
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      data-slot="navigation-menu-list"
      {...props}
    />
  );
}

function NavigationMenuItem({ className, ...props }: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item
      className={cn("relative", className)}
      data-slot="navigation-menu-item"
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm outline-none transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[popup-open]:bg-accent/50 data-[popup-open]:text-accent-foreground data-[popup-open]:focus:bg-accent data-[popup-open]:hover:bg-accent",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      data-slot="navigation-menu-trigger"
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        aria-hidden="true"
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[popup-open]:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "h-full w-[calc(100vw_-_40px)] xs:min-w-[400px] p-2 sm:w-max",
        "transition-[opacity,transform,translate] duration-[var(--duration)] ease-[var(--easing)]",
        "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        "data-[starting-style]:data-[activation-direction=left]:translate-x-[-50%]",
        "data-[starting-style]:data-[activation-direction=right]:translate-x-[50%]",
        "data-[ending-style]:data-[activation-direction=left]:translate-x-[50%]",
        "data-[ending-style]:data-[activation-direction=right]:translate-x-[-50%]",
        className,
      )}
      data-slot="navigation-menu-content"
      {...props}
    />
  );
}

function NavigationMenuPositioner({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        className={cn(
          "z-50 box-border h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-[instant]:transition-none data-[side=bottom]:before:top-[-10px] data-[side=left]:before:top-0 data-[side=right]:before:top-0 data-[side=bottom]:before:right-0 data-[side=left]:before:right-[-10px] data-[side=top]:before:right-0 data-[side=left]:before:bottom-0 data-[side=right]:before:bottom-0 data-[side=top]:before:bottom-[-10px] data-[side=bottom]:before:left-0 data-[side=right]:before:left-[-10px] data-[side=top]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=top]:before:h-2.5 data-[side=left]:before:w-2.5 data-[side=right]:before:w-2.5",
          className,
        )}
        collisionAvoidance={{ side: "none" }}
        collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
        data-slot="navigation-menu-positioner"
        sideOffset={10}
        style={
          {
            "--duration": "0.35s",
            "--easing": "cubic-bezier(0.22, 1, 0.36, 1)",
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

function NavigationMenuPopup({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Popup.Props) {
  return (
    <NavigationMenuPrimitive.Popup
      className={cn(
        "data-[ending-style]:easing-[ease] relative h-[var(--popup-height)] w-[var(--popup-width)] xs:w-[var(--popup-width)] origin-[var(--transform-origin)] rounded-lg bg-popover shadow-lg outline-1 outline-border transition-[opacity,transform,width,height,scale,translate] duration-[var(--duration)] ease-[var(--easing)] data-[ending-style]:scale-90 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[ending-style]:duration-150 dark:shadow-none dark:-outline-offset-1",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Popup>
  );
}

function NavigationMenuViewport({ className, ...props }: NavigationMenuPrimitive.Viewport.Props) {
  return (
    <NavigationMenuPrimitive.Viewport
      className={cn("relative h-full w-full overflow-hidden", className)}
      {...props}
    />
  );
}

function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active]:bg-accent/50 data-[active]:text-accent-foreground data-[active]:focus:bg-accent data-[active]:hover:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      data-slot="navigation-menu-link"
      {...props}
    />
  );
}

function NavigationMenuArrow({ className, ...props }: NavigationMenuPrimitive.Arrow.Props) {
  return (
    <NavigationMenuPrimitive.Arrow
      className={cn(
        "flex transition-[left] duration-[var(--duration)] ease-[var(--easing)] data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=top]:bottom-[-8px] data-[side=right]:left-[-13px] data-[side=left]:rotate-90 data-[side=right]:-rotate-90 data-[side=top]:rotate-180",
        className,
      )}
      data-slot="navigation-menu-arrow"
      {...props}
    >
      <ArrowSvg />
    </NavigationMenuPrimitive.Arrow>
  );
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg fill="none" height="10" viewBox="0 0 20 10" width="20" {...props}>
      <path
        className="fill-popover"
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
      />
      <path
        className="fill-border dark:fill-none"
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
      />
      <path
        className="dark:fill-border"
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
      />
    </svg>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuPositioner,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
  NavigationMenuPopup,
  NavigationMenuArrow,
};
