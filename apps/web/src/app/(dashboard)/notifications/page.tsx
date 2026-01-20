export default function NotificationsPage() {
  return (
    <>
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Manage your notification preferences and settings.</p>
      </div>

      {/* Coming Soon Card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              aria-label="Notifications icon"
              className="h-8 w-8 text-primary"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7M4.828 7H9m-4.172 0a2 2 0 012-2h2.172M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="font-semibold text-2xl">Coming Soon</h2>
          <p className="max-w-md text-muted-foreground">
            Notification management features are in development. You&apos;ll be able to customize
            your notifications here soon!
          </p>
        </div>
      </div>
    </>
  );
}
