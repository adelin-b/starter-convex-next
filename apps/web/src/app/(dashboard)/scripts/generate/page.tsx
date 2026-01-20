/* eslint-disable lingui/no-unlocalized-strings */

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@starter-saas/ui/breadcrumb";
import {
  PageHeader,
  PageHeaderBreadcrumb,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { ScriptGenerator } from "@/features/scripts";

export default function GenerateScriptPage() {
  return (
    <div className="container space-y-6 py-6">
      <PageHeaderBreadcrumb>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/scripts">Scripts</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Generate</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeaderBreadcrumb>

      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle className="flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            AI Script Generator
          </PageHeaderTitle>
          <PageHeaderDescription>
            Generate a personalized call script based on your prospect's context. The script
            includes opening hooks, discovery questions, value presentation, objection handling, and
            closing strategies.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <ScriptGenerator />
    </div>
  );
}
