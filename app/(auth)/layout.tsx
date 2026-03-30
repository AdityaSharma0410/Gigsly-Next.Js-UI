export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[hsl(224_47%_8%)] dark:to-[hsl(222_41%_12%)]">
      {children}
    </div>
  );
}
