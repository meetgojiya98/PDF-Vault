import Link from "next/link";

const tools = [
  {
    slug: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDFs into one file."
  },
  {
    slug: "split",
    name: "Split / Extract",
    description: "Extract page ranges into new PDFs."
  },
  {
    slug: "sign",
    name: "Sign",
    description: "Stamp a handwritten signature onto pages."
  },
  {
    slug: "redact",
    name: "Safe Redaction",
    description: "Flatten sensitive content permanently."
  },
  {
    slug: "compress",
    name: "Strong Compression",
    description: "Shrink files with bitmap compression."
  }
];

export function ToolGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={`/app/${tool.slug}`}
          className="card p-5 transition hover:border-cyan-300"
        >
          <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{tool.description}</p>
        </Link>
      ))}
    </div>
  );
}
