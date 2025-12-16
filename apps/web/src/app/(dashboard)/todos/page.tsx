import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { CreateTodoDialog, TodoList } from "@/features/todos";

export default function TodosPage() {
  return (
    <div className="container py-6 space-y-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Todos</PageHeaderTitle>
          <PageHeaderDescription>
            Manage your tasks and stay organized
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <CreateTodoDialog />
        </PageHeaderActions>
      </PageHeader>

      <TodoList />
    </div>
  );
}
