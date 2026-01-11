"use client";

import { CheckSquare } from "lucide-react";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateTodoDialog, TodoList } from "@/features/todos";

export default function TodosPage() {
  return (
    <PageLayout
      actions={<CreateTodoDialog />}
      description="Manage your tasks and stay organized"
      icon={CheckSquare}
      title="Todos"
    >
      <div className="max-w-3xl">
        <TodoList />
      </div>
    </PageLayout>
  );
}
