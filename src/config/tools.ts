import type { ToolSlug } from "../storage/indexedDb";

export type ToolCategory = "organize" | "review" | "delivery";

export type ToolDefinition = {
  slug: ToolSlug;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  category: ToolCategory;
  color: string;
  borderColor: string;
  gradient: string;
  keywords: string[];
  outputs: string[];
  idealFor: string[];
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  steps: ToolSlug[];
  badge: string;
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    slug: "merge",
    name: "Merge PDFs",
    shortDescription: "Combine multiple files with custom order.",
    longDescription: "Combine invoices, reports, or annexes into a single polished PDF.",
    icon: "📎",
    category: "organize",
    color: "from-sky-500/20 to-cyan-500/20",
    borderColor: "border-sky-400/35",
    gradient: "from-sky-300 to-cyan-300",
    keywords: ["combine", "join", "portfolio", "bundle"],
    outputs: ["single PDF"],
    idealFor: ["Contracts", "Application packets", "Client handoffs"]
  },
  {
    slug: "split",
    name: "Split & Extract",
    shortDescription: "Extract any page ranges into new files.",
    longDescription: "Break long documents into precise sections using flexible ranges.",
    icon: "✂️",
    category: "organize",
    color: "from-rose-500/20 to-orange-500/20",
    borderColor: "border-rose-400/35",
    gradient: "from-rose-300 to-orange-300",
    keywords: ["extract", "slice", "pages", "ranges"],
    outputs: ["single PDF", "one file per range"],
    idealFor: ["Legal exhibits", "Course packets", "Chapter exports"]
  },
  {
    slug: "sign",
    name: "Sign PDF",
    shortDescription: "Draw and place a handwritten signature.",
    longDescription: "Add your signature directly in browser with drag-and-place controls.",
    icon: "✍️",
    category: "review",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-400/35",
    gradient: "from-emerald-300 to-teal-300",
    keywords: ["signature", "approval", "agreement"],
    outputs: ["signed PDF"],
    idealFor: ["Offer letters", "NDA forms", "Government forms"]
  },
  {
    slug: "redact",
    name: "Safe Redaction",
    shortDescription: "Permanently remove sensitive visual content.",
    longDescription: "Draw redaction regions and flatten affected pages for secure sharing.",
    icon: "🧱",
    category: "review",
    color: "from-amber-500/20 to-red-500/20",
    borderColor: "border-amber-400/35",
    gradient: "from-amber-300 to-red-300",
    keywords: ["privacy", "mask", "blackout", "sensitive"],
    outputs: ["redacted PDF"],
    idealFor: ["PII cleanup", "Client sharing", "Public records"]
  },
  {
    slug: "compress",
    name: "Compress PDF",
    shortDescription: "Reduce size with quality controls.",
    longDescription: "Lower file size for portals and email attachments without extra tools.",
    icon: "📦",
    category: "delivery",
    color: "from-indigo-500/20 to-blue-500/20",
    borderColor: "border-indigo-400/35",
    gradient: "from-indigo-300 to-blue-300",
    keywords: ["optimize", "reduce", "email", "upload limit"],
    outputs: ["optimized PDF"],
    idealFor: ["Email sending", "Portal uploads", "Storage savings"]
  }
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "client-package",
    name: "Client Package",
    description: "Merge appendices, sign final page, then compress for email.",
    steps: ["merge", "sign", "compress"],
    badge: "Popular"
  },
  {
    id: "legal-disclosure",
    name: "Legal Disclosure",
    description: "Split the source doc and safely redact sensitive sections.",
    steps: ["split", "redact"],
    badge: "Compliance"
  },
  {
    id: "application-kit",
    name: "Application Kit",
    description: "Merge forms and certificates, then compress for upload limits.",
    steps: ["merge", "compress"],
    badge: "Fast"
  }
];

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  organize: "Organize",
  review: "Review",
  delivery: "Delivery"
};

export const TOOL_BY_SLUG = Object.fromEntries(
  TOOL_DEFINITIONS.map((tool) => [tool.slug, tool] as const)
) as Record<ToolSlug, ToolDefinition>;
