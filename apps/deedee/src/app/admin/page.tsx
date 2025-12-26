export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the admin panel. Manage users, review KYC, and oversee system operations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats cards */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-2 font-semibold">Total Users</h3>
          <p className="font-bold text-3xl">0</p>
          <p className="mt-1 text-muted-foreground text-sm">Registered users</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-2 font-semibold">Pending KYC</h3>
          <p className="font-bold text-3xl">0</p>
          <p className="mt-1 text-muted-foreground text-sm">Awaiting review</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-2 font-semibold">Active Today</h3>
          <p className="font-bold text-3xl">0</p>
          <p className="mt-1 text-muted-foreground text-sm">Users online</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Quick Actions</h3>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            • View and manage all users in User Management
          </p>
          <p className="text-muted-foreground text-sm">• Review pending KYC submissions</p>
          <p className="text-muted-foreground text-sm">• Send notifications to users</p>
          <p className="text-muted-foreground text-sm">
            • Access system settings and configuration
          </p>
        </div>
      </div>
    </div>
  );
}
