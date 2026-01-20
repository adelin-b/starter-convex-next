/* eslint-disable lingui/no-unlocalized-strings */
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { AgentList, CreateAgentDialog } from "@/features/agents";

export default function AgentsPage() {
  return (
    <div className="container space-y-6 py-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Agents</PageHeaderTitle>
          <PageHeaderDescription>
            Manage your AI agents and organize them into folders
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <CreateAgentDialog />
        </PageHeaderActions>
      </PageHeader>

      <AgentList />
    </div>
  );
}
