export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/40 p-6">
      <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          R
        </span>
        Rocky OS
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
