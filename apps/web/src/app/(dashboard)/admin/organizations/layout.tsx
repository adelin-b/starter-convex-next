import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Organizations",
};

export default function OrganizationsLayout({ children }: { children: ReactNode }) {
  return children;
}
