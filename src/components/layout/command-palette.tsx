"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { navItems } from "./nav-items";

type SearchResults = {
  tasks: { id: string; title: string }[];
  projects: { id: string; title: string }[];
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ tasks: [], projects: [] });
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then(setResults)
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const visibleResults = query.trim() ? results : { tasks: [], projects: [] };

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-64 justify-start gap-2 text-muted-foreground hidden sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        Search everything…
        <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search tasks, projects, or jump to a page…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Go to">
              {navItems.map((item) => (
                <CommandItem key={item.href} onSelect={() => go(item.href)}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
            {visibleResults.projects.length > 0 && (
              <CommandGroup heading="Projects">
                {visibleResults.projects.map((p) => (
                  <CommandItem key={p.id} onSelect={() => go(`/projects/${p.id}`)}>
                    {p.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {visibleResults.tasks.length > 0 && (
              <CommandGroup heading="Tasks">
                {visibleResults.tasks.map((t) => (
                  <CommandItem key={t.id} onSelect={() => go(`/tasks?highlight=${t.id}`)}>
                    {t.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
