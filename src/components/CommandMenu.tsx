import {
  Briefcase,
  Copy,
  Download,
  FolderGit2,
  Mail,
  Phone,
  RotateCcw,
  Turtle,
  Wrench,
} from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { LinkedInIcon } from "@/components/icons"
import { profile } from "@/data/resume"
import { copyText, replayHero } from "@/lib/motion"

export default function CommandMenu({
  open,
  setOpen,
  go,
}: {
  open: boolean
  setOpen: (o: boolean) => void
  go: (id: string) => void
}) {
  const run = (fn: () => void) => {
    setOpen(false)
    window.setTimeout(fn, 120)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Jump anywhere"
      description="Search sections and actions"
      className="border border-ink/10 bg-popover sm:max-w-lg"
    >
      <Command className="bg-transparent">
        <CommandInput placeholder="Search sections and actions" />
        <CommandList data-lenis-prevent>
          <CommandEmpty>Nothing matches. Try "email" or "projects".</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem onSelect={() => run(() => go("project-portals"))}>
              <FolderGit2 /> PNB MetLife portals demo
            </CommandItem>
            <CommandItem onSelect={() => run(() => go("project-chatbot"))}>
              <FolderGit2 /> AI chatbot demo
            </CommandItem>
            <CommandItem onSelect={() => run(() => go("project-peconnect"))}>
              <FolderGit2 /> PeConnect demo
            </CommandItem>
            <CommandItem onSelect={() => run(() => go("experience"))}>
              <Briefcase /> Experience
            </CommandItem>
            <CommandItem onSelect={() => run(() => go("toolkit"))}>
              <Wrench /> Toolkit
            </CommandItem>
            <CommandItem onSelect={() => run(() => go("contact"))}>
              <Mail /> Contact
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Get in touch">
            <CommandItem onSelect={() => run(() => copyText(profile.email, "Email copied"))}>
              <Copy /> Copy email address
              <CommandShortcut>{profile.email}</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(() => (window.location.href = `mailto:${profile.email}`))}>
              <Mail /> Write an email
            </CommandItem>
            <CommandItem onSelect={() => run(() => window.open(profile.linkedin, "_blank", "noopener"))}>
              <LinkedInIcon /> Open LinkedIn
            </CommandItem>
            <CommandItem onSelect={() => run(() => (window.location.href = profile.phoneHref))}>
              <Phone /> Call {profile.phone}
            </CommandItem>
            <CommandItem onSelect={() => run(() => window.open(profile.resume, "_blank"))}>
              <Download /> Download resume (PDF)
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Play">
            <CommandItem onSelect={() => run(() => replayHero(1600))}>
              <RotateCcw /> Replay this page's render at 1.6s
            </CommandItem>
            <CommandItem onSelect={() => run(() => replayHero(3200))}>
              <Turtle /> Replay it at the legacy 3.2s
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
