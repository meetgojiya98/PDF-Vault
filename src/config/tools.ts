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
  },
  {
    slug: "rotate",
    name: "Rotate Pages",
    shortDescription: "Rotate all pages or selected ranges.",
    longDescription: "Fix scanned orientation in one click, or rotate only selected page ranges.",
    icon: "↻",
    category: "organize",
    color: "from-fuchsia-500/20 to-violet-500/20",
    borderColor: "border-fuchsia-400/35",
    gradient: "from-fuchsia-300 to-violet-300",
    keywords: ["orientation", "landscape", "portrait", "scan"],
    outputs: ["rotated PDF"],
    idealFor: ["Scanned forms", "Camera captures", "Archival cleanup"]
  },
  {
    slug: "watermark",
    name: "Watermark",
    shortDescription: "Apply text watermark across pages.",
    longDescription: "Overlay custom text like DRAFT or CONFIDENTIAL with opacity and angle controls.",
    icon: "🪪",
    category: "review",
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-400/35",
    gradient: "from-cyan-300 to-blue-300",
    keywords: ["confidential", "draft", "brand", "overlay"],
    outputs: ["watermarked PDF"],
    idealFor: ["Internal reviews", "Draft circulation", "Brand control"]
  },
  {
    slug: "number",
    name: "Page Numbers",
    shortDescription: "Add customizable page numbering.",
    longDescription: "Apply styled page numbers with prefix, start index, position, and opacity controls.",
    icon: "#",
    category: "review",
    color: "from-lime-500/20 to-emerald-500/20",
    borderColor: "border-lime-400/35",
    gradient: "from-lime-300 to-emerald-300",
    keywords: ["pagination", "index", "footer", "header"],
    outputs: ["numbered PDF"],
    idealFor: ["Reports", "Contracts", "Booklets"]
  },
  {
    slug: "metadata",
    name: "Metadata Editor",
    shortDescription: "Edit title, author, and document metadata.",
    longDescription: "Set professional metadata fields for searchability, archiving, and compliance workflows.",
    icon: "🧾",
    category: "review",
    color: "from-teal-500/20 to-cyan-500/20",
    borderColor: "border-teal-400/35",
    gradient: "from-teal-300 to-cyan-300",
    keywords: ["title", "author", "keywords", "properties"],
    outputs: ["metadata-updated PDF"],
    idealFor: ["Records teams", "Compliance archives", "Publishing"]
  },
  {
    slug: "crop",
    name: "Crop Pages",
    shortDescription: "Crop margins with precise controls.",
    longDescription: "Trim page margins from selected ranges to improve print fit and readability.",
    icon: "🗜",
    category: "organize",
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-400/35",
    gradient: "from-amber-300 to-yellow-300",
    keywords: ["trim", "margins", "layout", "print"],
    outputs: ["cropped PDF"],
    idealFor: ["Scanned pages", "Print-ready docs", "Presentation decks"]
  },
  {
    slug: "delete",
    name: "Delete Pages",
    shortDescription: "Remove pages by range or odd/even rule.",
    longDescription: "Delete unwanted pages in bulk by custom ranges or parity filters.",
    icon: "🗑",
    category: "organize",
    color: "from-rose-500/20 to-red-500/20",
    borderColor: "border-rose-400/35",
    gradient: "from-rose-300 to-red-300",
    keywords: ["remove", "cleanup", "odd", "even"],
    outputs: ["cleaned PDF"],
    idealFor: ["Draft cleanup", "Scan cleanup", "Appendix removal"]
  },
  {
    slug: "reverse",
    name: "Reverse Pages",
    shortDescription: "Reverse page order instantly.",
    longDescription: "Flip document page order for reverse-printed scans and archival corrections.",
    icon: "↺",
    category: "organize",
    color: "from-indigo-500/20 to-violet-500/20",
    borderColor: "border-indigo-400/35",
    gradient: "from-indigo-300 to-violet-300",
    keywords: ["reverse", "reorder", "flip", "sequence"],
    outputs: ["reversed PDF"],
    idealFor: ["Back scans", "Print corrections", "Legacy docs"]
  },
  {
    slug: "reorder",
    name: "Reorder Pages",
    shortDescription: "Rebuild document with custom page order.",
    longDescription: "Define explicit page order using ranges and page numbers to build a custom sequence.",
    icon: "🔀",
    category: "organize",
    color: "from-cyan-500/20 to-sky-500/20",
    borderColor: "border-cyan-400/35",
    gradient: "from-cyan-300 to-sky-300",
    keywords: ["sequence", "custom order", "arrange"],
    outputs: ["reordered PDF"],
    idealFor: ["Manual packets", "Exam papers", "Board decks"]
  },
  {
    slug: "duplicate",
    name: "Duplicate Pages",
    shortDescription: "Repeat selected pages multiple times.",
    longDescription: "Duplicate target page ranges inline with configurable repeat count for print runs and inserts.",
    icon: "➕",
    category: "organize",
    color: "from-emerald-500/20 to-green-500/20",
    borderColor: "border-emerald-400/35",
    gradient: "from-emerald-300 to-green-300",
    keywords: ["repeat", "clone", "copies"],
    outputs: ["duplicated PDF"],
    idealFor: ["Insert pages", "Print copies", "Booklet prep"]
  },
  {
    slug: "interleave",
    name: "Interleave PDFs",
    shortDescription: "Alternate pages from multiple PDFs.",
    longDescription: "Merge two or more PDFs by alternating pages in sequence (A1, B1, A2, B2...).",
    icon: "🪢",
    category: "organize",
    color: "from-violet-500/20 to-indigo-500/20",
    borderColor: "border-violet-400/35",
    gradient: "from-violet-300 to-indigo-300",
    keywords: ["alternate", "a/b merge", "collate"],
    outputs: ["interleaved PDF"],
    idealFor: ["Scanned duplex docs", "Appendix alternation", "Print collation"]
  },
  {
    slug: "margin",
    name: "Add Margins",
    shortDescription: "Expand page canvas with custom margins.",
    longDescription: "Add white space around pages with top/right/bottom/left controls on all or selected ranges.",
    icon: "🧩",
    category: "organize",
    color: "from-amber-500/20 to-lime-500/20",
    borderColor: "border-amber-400/35",
    gradient: "from-amber-300 to-lime-300",
    keywords: ["padding", "whitespace", "print margin"],
    outputs: ["margin-adjusted PDF"],
    idealFor: ["Print-safe docs", "Binding margins", "Layout cleanup"]
  },
  {
    slug: "grayscale",
    name: "Grayscale",
    shortDescription: "Convert pages to grayscale output.",
    longDescription: "Render PDF pages in grayscale with quality controls for archive-friendly monochrome versions.",
    icon: "⚫",
    category: "delivery",
    color: "from-slate-500/20 to-zinc-500/20",
    borderColor: "border-slate-400/35",
    gradient: "from-slate-300 to-zinc-300",
    keywords: ["black and white", "mono", "archive"],
    outputs: ["grayscale PDF"],
    idealFor: ["Archiving", "Low-ink prints", "Monochrome exports"]
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
  },
  {
    id: "draft-review",
    name: "Draft Review",
    description: "Add DRAFT watermark and rotate misoriented scans before sharing.",
    steps: ["watermark", "rotate", "compress"],
    badge: "Editorial"
  },
  {
    id: "publish-ready",
    name: "Publish Ready",
    description: "Crop margins, add page numbers, and set metadata before final export.",
    steps: ["crop", "number", "metadata"],
    badge: "Publishing"
  },
  {
    id: "scan-cleanup",
    name: "Scan Cleanup",
    description: "Remove unwanted pages and reverse order for corrected scan packets.",
    steps: ["delete", "reverse"],
    badge: "Ops"
  },
  {
    id: "print-pack",
    name: "Print Pack",
    description: "Reorder pages, add margins, then duplicate target pages for print inserts.",
    steps: ["reorder", "margin", "duplicate"],
    badge: "Print"
  },
  {
    id: "archive-mono",
    name: "Archive Mono",
    description: "Interleave scanned files then create grayscale archive output.",
    steps: ["interleave", "grayscale", "compress"],
    badge: "Archive"
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
