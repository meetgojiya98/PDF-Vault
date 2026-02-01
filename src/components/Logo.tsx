"use client";

export function FuturisticLogo({ className = "w-10 h-10", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${className} relative group`}>
        {/* Outer glow ring */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        
        {/* Main logo container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-0.5 shadow-xl group-hover:scale-110 transition-transform duration-300">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(34,211,238,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer"></div>
            </div>
            
            {/* PDF Symbol - Stylized */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="none">
                {/* Document outline */}
                <path 
                  d="M7 3H17L21 7V21H7V3Z" 
                  stroke="url(#logo-gradient)" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="animate-pulse-glow"
                />
                {/* Corner fold */}
                <path 
                  d="M17 3V7H21" 
                  stroke="url(#logo-gradient)" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                {/* Futuristic lines */}
                <line x1="10" y1="12" x2="18" y2="12" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
                <line x1="10" y1="15" x2="18" y2="15" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
                <line x1="10" y1="18" x2="16" y2="18" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
                {/* Center glow point */}
                <circle cx="6" cy="12" r="2" fill="url(#logo-gradient)" className="animate-pulse" />
                
                <defs>
                  <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-400 opacity-50"></div>
          </div>
        </div>
      </div>
      
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse-glow">
          PDF Vault
        </span>
      )}
    </div>
  );
}

// Simplified version for nav
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  return <FuturisticLogo className={sizeClasses[size]} showText={size !== "sm"} />;
}
