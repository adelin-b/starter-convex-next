import { Badge } from "@starter-saas/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Calendar, FolderOpen, TrendingUp } from "lucide-react";

export default function Page() {
  return (
    <>
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Welcome to Dashboard</h1>
        <p className="text-muted-foreground">Manage your projects and activities in one place.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">12</div>
            <p className="text-muted-foreground text-xs">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">8</div>
            <p className="text-muted-foreground text-xs">3 due this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">85%</div>
            <p className="text-muted-foreground text-xs">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Project completed</p>
                <p className="text-muted-foreground text-xs">
                  Project Alpha has been successfully completed
                </p>
              </div>
              <Badge variant="secondary">2 hours ago</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">New task created</p>
                <p className="text-muted-foreground text-xs">Task added to Project Beta</p>
              </div>
              <Badge variant="secondary">4 hours ago</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Project update</p>
                <p className="text-muted-foreground text-xs">Project Beta reached 75% completion</p>
              </div>
              <Badge variant="secondary">1 day ago</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">New project started</p>
                <p className="text-muted-foreground text-xs">Project Gamma has been initialized</p>
              </div>
              <Badge variant="secondary">2 days ago</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
              type="button"
            >
              <FolderOpen className="h-5 w-5" />
              <div>
                <p className="font-medium">Create Project</p>
                <p className="text-muted-foreground text-sm">Start a new project</p>
              </div>
            </button>
            <button
              className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
              type="button"
            >
              <Calendar className="h-5 w-5" />
              <div>
                <p className="font-medium">Add Task</p>
                <p className="text-muted-foreground text-sm">Create a new task</p>
              </div>
            </button>
            <button
              className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
              type="button"
            >
              <TrendingUp className="h-5 w-5" />
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-muted-foreground text-sm">Check performance metrics</p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
