import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { images } from "@/data/images";
import { Logo } from "./logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 animate-fade-up">{children}</div>
        <p className="text-center text-xs text-muted-foreground">
          Prototype — accounts are stored only in this browser. <Link to="/" className="font-semibold text-primary hover:underline">Back to home</Link>
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <img src={images.hero} alt="" width={1600} height={1008} className="absolute inset-0 size-full object-cover opacity-70 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/40 to-transparent" />
        <div className="absolute bottom-0 p-12 text-primary-foreground">
          <p className="font-display text-4xl font-extrabold leading-tight">
            Your canteen order,
            <br />
            <span className="text-highlight">ready when you are.</span>
          </p>
          <p className="mt-3 max-w-sm text-primary-foreground/80">Order between lectures. Pick up on the way. No queues.</p>
        </div>
      </div>
    </div>
  );
}
