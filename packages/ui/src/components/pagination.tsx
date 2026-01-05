import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { cn } from "@starter-saas/ui/utils";
import type * as React from "react";
import { type ButtonProps, buttonVariants } from "@/components/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"ul"> & {
  ref?: React.RefObject<HTMLUListElement | null>;
}) => <ul className={cn("flex flex-row items-center gap-1", className)} ref={ref} {...props} />;
PaginationContent.displayName = "PaginationContent";

const PaginationItem = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"li"> & {
  ref?: React.RefObject<HTMLLIElement | null>;
}) => <li className={cn("", className)} ref={ref} {...props} />;
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  size,
  label = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn("gap-1 pl-2.5", className)}
    size={size}
    {...props}
  >
    <ChevronLeftIcon className="h-4 w-4" />
    <span>{label}</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  size,
  label = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn("gap-1 pr-2.5", className)}
    size={size}
    {...props}
  >
    <span>{label}</span>
    <ChevronRightIcon className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  label = "More pages",
  ...props
}: React.ComponentProps<"span"> & { label?: string }) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <DotsHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">{label}</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
