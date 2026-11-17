import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentStudent, useHydrated } from "@/store/app-store";
import { EmptyState } from "./bits";
import type { Student } from "@/lib/types";

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-5 w-96 max-w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Shows children only for a signed-in student (demo auth stored in this browser). */
export function StudentGate({ children, title = "Log in to continue", description }: { children: (user: Student) => ReactNode; title?: string; description?: string }) {
  const hydrated = useHydrated();
  const user = useCurrentStudent();
  if (!hydrated) return <PageSkeleton />;
  if (!user)
    return (
      <EmptyState
        icon={<LockKeyhole />}
        title={title}
        description={description ?? "Sign in with your campus account to see this page."}
        action={
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        }
      />
    );
  return <>{children(user)}</>;
}
