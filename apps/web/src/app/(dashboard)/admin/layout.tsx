import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s | Starter SaaS",
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
