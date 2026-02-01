"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const tools = [
  {
    slug: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDFs into one file.",
    icon: "📄",
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    gradient: "from-cyan-400 to-blue-400",
    hoverGlow: "group-hover:shadow-cyan-500/50"
  },
  {
    slug: "split",
    name: "Split PDF",
    description: "Extract specific pages or ranges from a PDF.",
    icon: "✂️",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    gradient: "from-purple-400 to-pink-400",
    hoverGlow: "group-hover:shadow-purple-500/50"
  },
  {
    slug: "sign",
    name: "Sign PDF",
    description: "Add your digital signature to documents.",
    icon: "✍️",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    gradient: "from-emerald-400 to-teal-400",
    hoverGlow: "group-hover:shadow-emerald-500/50"
  },
  {
    slug: "redact",
    name: "Redact PDF",
    description: "Permanently remove sensitive information.",
    icon: "🔒",
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    gradient: "from-orange-400 to-red-400",
    hoverGlow: "group-hover:shadow-orange-500/50"
  },
  {
    slug: "compress",
    name: "Compress PDF",
    description: "Reduce file size by optimizing images.",
    icon: "📦",
    color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-400 to-indigo-400",
    hoverGlow: "group-hover:shadow-blue-500/50"
  }
];

export function ToolGrid() {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>, index: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool, index) => (
        <Link
          key={tool.slug}
          href={`/app/${tool.slug}`}
          className={`card-hover group relative p-8 ${mounted ? 'animate-fade-in' : 'opacity-0'} transition-all duration-500 hover:scale-105 ${tool.hoverGlow}`}
          style={{ 
            animationDelay: `${index * 100}ms`,
            transform: hoveredIndex === index ? 'translateY(-8px)' : 'translateY(0)',
          }}
          onMouseMove={(e) => handleMouseMove(e, index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
          
          {/* Floating orb effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            {/* Icon with 3D effect */}
            <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} border ${tool.borderColor} flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg ${tool.hoverGlow}`}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">{tool.icon}</span>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className={`text-2xl font-black bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 origin-left`}>
                {tool.name}
              </h3>
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">
                {tool.description}
              </p>
            </div>

            {/* Arrow indicator with animation */}
            <div className="mt-6 flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
              <span className="text-sm font-semibold">Launch tool</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>

          {/* Border glow effect */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-2 ${tool.borderColor} shadow-2xl ${tool.hoverGlow}`}></div>
        </Link>
      ))}
    </div>
  );
}
