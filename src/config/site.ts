// Single place for facts that appear in several spots on the site.
// Everything here is public: do not add the phone number.

export const site = {
  name: "Vincent Sotoya",
  firstName: "Vincent",
  lastName: "Sotoya",
  title: "Vincent Sotoya — Technical Virtual Assistant",
  description:
    "Technical virtual assistant for executives and teams: email, calendar, documents and workflow automation, backed by 3+ years as a software engineer.",
  email: "vincentsotoya20@gmail.com",
  // TODO: paste the real Calendly link for the 15-minute Intro Call.
  // While empty, "Book an Intro Call" falls back to the contact section.
  calendlyUrl: "",
  github: "https://github.com/vincentsotoya",
  linkedin: "https://www.linkedin.com/in/vincent-sotoya",
  timeZone: "Asia/Manila",
  timeZoneLabel: "PHT",
  location: "Philippines",
  // Set by hand: "available" | "limited" | "booked".
  availability: "available" as "available" | "limited" | "booked",
  // Shown in the hero while the Owner is still in Japan. Set to "" once back home.
  japanNote: "Currently working in Japan until November 2026",
  // TODO: fill in for the "How I work" strip; empty values are not shown.
  responseTime: "",
} as const;

export const availabilityLabel = {
  available: "Available for hire",
  limited: "Limited availability",
  booked: "Fully booked",
}[site.availability];

export const introCallHref = site.calendlyUrl || "/#contact";
export const introCallExternal = Boolean(site.calendlyUrl);
