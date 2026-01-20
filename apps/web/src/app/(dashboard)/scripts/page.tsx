/* eslint-disable lingui/no-unlocalized-strings */

import { Button } from "@starter-saas/ui/button";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function ScriptsPage() {
  return (
    <div className="container space-y-6 py-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle className="flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Call Scripts
          </PageHeaderTitle>
          <PageHeaderDescription>
            Generate and manage personalized call scripts for your prospects
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link href="/scripts/generate">
            <Button data-testid="new-script-button">
              <Plus className="mr-2 size-4" />
              Generate New Script
            </Button>
          </Link>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick actions card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Quick Generate</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Create a personalized script tailored to your prospect's industry, role, and pain
            points.
          </p>
          <Link href="/scripts/generate">
            <Button className="mt-4" variant="secondary">
              Generate Script
            </Button>
          </Link>
        </div>

        {/* Templates card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Script Templates</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Browse pre-built templates for common scenarios like discovery calls, demos, and
            follow-ups.
          </p>
          <Button className="mt-4" disabled variant="outline">
            Coming Soon
          </Button>
        </div>

        {/* History card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Script History</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            View and reuse previously generated scripts. Track which scripts were most effective.
          </p>
          <Button className="mt-4" disabled variant="outline">
            Coming Soon
          </Button>
        </div>
      </div>

      {/* Stats section */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="font-bold text-2xl">0</div>
          <div className="text-muted-foreground text-sm">Scripts Generated</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="font-bold text-2xl">0</div>
          <div className="text-muted-foreground text-sm">Scripts Used</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="font-bold text-2xl">-</div>
          <div className="text-muted-foreground text-sm">Avg. Effectiveness</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="font-bold text-2xl">-</div>
          <div className="text-muted-foreground text-sm">Most Used Industry</div>
        </div>
      </div>
    </div>
  );
}
