import Link from "next/link";
import { ArrowLeft } from "@/components/shared/site-icons";
import { Button } from "@/components/ui/button";
import { notFoundConfig } from "@/config/not-found";

export function NotFoundContent() {
  return (
    <div className="w-full max-w-lg text-center">
      <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
        {notFoundConfig.title}
      </p>

      <p className="mt-5 select-none font-serif text-[clamp(6rem,26vw,10rem)] leading-none tracking-tight text-foreground">
        {notFoundConfig.code}
      </p>

      <div className="mt-5 sm:mt-6">
        <h1 className="text-balance font-serif text-4xl font-medium italic tracking-tight sm:text-[2.75rem]">
          {notFoundConfig.heading}
        </h1>
        <p className="mx-auto mt-3 max-w-68 text-pretty text-sm leading-relaxed text-muted-foreground">
          {notFoundConfig.description}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild className="group h-9 gap-2 px-3.5">
          <Link href={notFoundConfig.home.href}>
            <ArrowLeft
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none"
            />
            {notFoundConfig.home.label}
          </Link>
        </Button>
      </div>
    </div>
  );
}