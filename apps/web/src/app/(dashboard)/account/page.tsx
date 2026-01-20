export default function AccountPage() {
  return (
    <>
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings.
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              aria-label="Account settings icon"
              className="h-8 w-8 text-primary"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="font-semibold text-2xl">Coming Soon</h2>
          <p className="max-w-md text-muted-foreground">
            Account management features are in development. You&apos;ll be able to manage your
            account settings here soon!
          </p>
        </div>
      </div>
    </>
  );
}
