// The four Services. Each one lists only tools the Owner has actually used and
// is backed by one Sample (built in a later phase, labelled "sample").
// `art` selects the card background in global.css; `clip` is filled in phase 2.

export interface Service {
  num: string;
  title: string;
  summary: string;
  tools: string[];
  sample: string;
  art: "email" | "calendar" | "docs" | "automation";
  clip?: string;
}

export const services: Service[] = [
  {
    num: "01",
    title: "Email Management",
    summary: "Inbox triage, filters and labels, drafted replies and follow-ups, so only what needs you reaches you.",
    tools: ["Gmail", "Google Drive"],
    sample: "Sample: Gmail filter and label set for an executive inbox",
    art: "email",
  },
  {
    num: "02",
    title: "Calendar Management",
    summary: "Scheduling, conflict handling, reminders and booking links, with time zones handled for you.",
    tools: ["Google Calendar", "Calendly"],
    sample: "Sample: scheduling workflow that resolves a double booking",
    art: "calendar",
  },
  {
    num: "03",
    title: "Document & Data Entry",
    summary: "Accurate spreadsheets, cleaned-up data, reports and tidy shared folders.",
    tools: ["Google Sheets", "Google Drive"],
    sample: "Sample: messy export cleaned into a formatted report",
    art: "docs",
  },
  {
    num: "04",
    title: "Workflow Automation",
    summary: "Small scripts and automations that remove repetitive admin.",
    tools: ["JavaScript", "Node.js", "Slack"],
    sample: "Sample: automation that files and notifies on incoming requests",
    art: "automation",
  },
];
