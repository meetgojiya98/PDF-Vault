# 🎨 Visual Design Guide - PDF Vault

## Brand Identity

### Logo
```
┌──────────┐
│    P     │  - Gradient square badge (cyan to blue)
└──────────┘  - White bold letter
PDF Vault     - Brand name in bold
```

### Tagline
"Offline PDF tools. Private. Fast."

### Brand Values
- Privacy First
- Offline Capable
- Enterprise Quality
- User Friendly

---

## Color System

### Primary Colors
```css
Cyan-500:    #22d3ee  /* Primary brand color */
Blue-500:    #3b82f6  /* Secondary accent */
Slate-950:   #020617  /* Background dark */
Slate-900:   #0f172a  /* Card backgrounds */
White:       #ffffff  /* Text primary */
```

### Accent Colors
```css
/* Tool Categories */
Cyan → Blue:      Merge PDFs
Purple → Pink:    Split & Extract
Emerald → Teal:   Digital Signature
Orange → Red:     Safe Redaction
Blue → Indigo:    Compression
Amber → Yellow:   Batch Processing
```

### Semantic Colors
```css
Success:  #10b981  /* Emerald-500 */
Warning:  #f59e0b  /* Amber-500 */
Error:    #ef4444  /* Red-500 */
Info:     #3b82f6  /* Blue-500 */
```

### Opacity Scale
```css
100%: Headings, primary text
80%:  Body text
60%:  Secondary text
40%:  Placeholder text
30%:  Disabled elements
20%:  Subtle backgrounds
10%:  Hover overlays
5%:   Ultra-subtle effects
```

---

## Typography

### Font Family
```css
font-family: system-ui, -apple-system, sans-serif;
```

### Scale
```css
9XL:  text-9xl    128px   Hero headlines
7XL:  text-7xl    72px    Main headlines
5XL:  text-5xl    48px    Section headers
3XL:  text-3xl    30px    Card titles
2XL:  text-2xl    24px    Subheadings
XL:   text-xl     20px    Large body
LG:   text-lg     18px    Body text
Base: text-base   16px    Default
SM:   text-sm     14px    Small text
XS:   text-xs     12px    Helper text
```

### Weights
```css
Black:      font-black      900   Headlines
Bold:       font-bold       700   Strong emphasis
Semibold:   font-semibold   600   Medium emphasis
Medium:     font-medium     500   Subtle emphasis
Regular:    font-normal     400   Body text
```

### Line Heights
```css
Tight:    leading-tight     1.25   Headlines
Snug:     leading-snug      1.375  Subheadings
Normal:   leading-normal    1.5    Body text
Relaxed:  leading-relaxed   1.625  Long-form
```

---

## Spacing System

### Scale (Tailwind)
```css
1:   0.25rem   4px    Micro spacing
2:   0.5rem    8px    Tiny gaps
3:   0.75rem   12px   Small spacing
4:   1rem      16px   Base spacing
5:   1.25rem   20px   Medium spacing
6:   1.5rem    24px   Large spacing
8:   2rem      32px   Section spacing
10:  2.5rem    40px   Major spacing
12:  3rem      48px   Hero spacing
16:  4rem      64px   Mega spacing
20:  5rem      80px   Ultra spacing
```

### Usage
```css
Gap-3:     12px between flex/grid items
P-6:       24px padding inside cards
MB-8:      32px margin below sections
Space-y-4: 16px vertical stack spacing
```

---

## Border Radius

```css
None:    rounded-none      0px      Sharp edges
SM:      rounded-sm        2px      Subtle rounding
Base:    rounded          4px      Default
LG:      rounded-lg        8px      Cards
XL:      rounded-xl        12px     Badges, icons
2XL:     rounded-2xl       16px     Major cards
Full:    rounded-full      9999px   Pills, circles
```

---

## Shadows

### Elevation Levels
```css
Level 1 (SM):
  shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
  Usage: Subtle depth

Level 2 (Base):
  shadow: 0 1px 3px rgba(0,0,0,0.1)
  Usage: Cards at rest

Level 3 (LG):
  shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
  Usage: Floating elements

Level 4 (XL):
  shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
  Usage: Modals, dropdowns

Level 5 (2XL):
  shadow-2xl: 0 25px 50px rgba(0,0,0,0.25)
  Usage: Maximum elevation
```

### Colored Shadows
```css
Cyan:     shadow-cyan-500/30
Blue:     shadow-blue-500/30
Purple:   shadow-purple-500/30
Emerald:  shadow-emerald-500/30
```

---

## Effects

### Backdrop Blur
```css
None:   backdrop-blur-none    0px
SM:     backdrop-blur-sm      4px
Base:   backdrop-blur         8px
LG:     backdrop-blur-lg      16px
XL:     backdrop-blur-xl      24px
```

### Opacity
```css
0:      opacity-0       Invisible
5:      opacity-5       Barely visible
10:     opacity-10      Very subtle
20:     opacity-20      Subtle
50:     opacity-50      Half transparent
80:     opacity-80      Mostly opaque
100:    opacity-100     Fully opaque
```

### Gradients
```css
Hero Background:
  radial-gradient(ellipse, rgba(120,119,198,0.3), transparent)
  + radial-gradient(ellipse, rgba(34,211,238,0.25), transparent)
  + linear-gradient(180deg, #0f172a, #020617)

Card Border:
  linear-gradient(135deg, rgba(255,255,255,0.1), transparent)

Button:
  linear-gradient(90deg, #22d3ee, #3b82f6)

Top Accent:
  linear-gradient(90deg, #22d3ee, #3b82f6, #8b5cf6)
```

---

## Animations

### Timing Functions
```css
Linear:     transition-linear       linear
Ease:       transition-ease         cubic-bezier(0.25, 0.1, 0.25, 1)
Ease-in:    transition-ease-in      cubic-bezier(0.4, 0, 1, 1)
Ease-out:   transition-ease-out     cubic-bezier(0, 0, 0.2, 1)
Custom:     cubic-bezier(0.4, 0, 0.2, 1)
```

### Durations
```css
Instant:    75ms     Micro feedback
Fast:       150ms    Quick actions
Normal:     300ms    Default transitions
Slow:       500ms    Deliberate changes
Slower:     700ms    Dramatic effects
```

### Custom Keyframes
```css
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulseGlow {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 20px rgba(34,211,238,0.3); 
  }
  50% { 
    opacity: 0.8; 
    box-shadow: 0 0 40px rgba(34,211,238,0.5); 
  }
}
```

---

## Component Patterns

### Card Anatomy
```
┌─────────────────────────────────────┐
│ ┌─────┐                             │ ← 1px gradient border
│ │ 🎯 │ Title                        │ ← Icon + Heading
│ └─────┘                             │
│                                     │
│ Description text that explains      │ ← Body text
│ what this card represents.          │
│                                     │
│ [Action Button →]                   │ ← CTA
└─────────────────────────────────────┘
 ← Hover: scale, glow, lighting
```

### Button States
```
Rest:    Gradient bg, shadow
Hover:   Y-lift, enhanced shadow, overlay
Active:  Y-reset, reduced shadow
Disabled: Reduced opacity, no pointer
Loading:  Spinner, disabled state
```

### Modal Pattern
```
 Background Overlay (blur + dark)
┌─────────────────────────────────┐
│ ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ │ ← Gradient line
│                                 │
│ ┌─────┐                    [×]  │ ← Icon + Close
│ │ ✓  │ Modal Title             │
│ └─────┘                         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Card content here           │ │ ← Info cards
│ └─────────────────────────────┘ │
│                                 │
│ [Primary Action]                │ ← CTAs
│ [Secondary Action]              │
└─────────────────────────────────┘
```

### Navigation Pattern
```
┌──────────────────────────────────────────────┐
│ [Logo]          [Nav 1] [Nav 2] [Nav 3]      │
│  P + Name       ← Pills with active state    │
└──────────────────────────────────────────────┘
 ← Sticky, blur on scroll
```

---

## Icon System

### Sizes
```css
XS:   w-3 h-3    12px    Inline icons
SM:   w-4 h-4    16px    Small badges
Base: w-5 h-5    20px    Default icons
LG:   w-6 h-6    24px    Card icons
XL:   w-8 h-8    32px    Hero icons
2XL:  w-10 h-10  40px    Feature icons
```

### Style
- Outlined (stroke-2) for interactive elements
- Filled for status indicators
- Gradient fills for brand icons
- Consistent stroke width (2px)

### Categories
```
Files:       📄 Document icon
Security:    🔒 Lock icon
Speed:       ⚡ Lightning icon
Tools:       🛠️ Wrench icon
Upload:      ⬆️ Arrow up icon
Download:    ⬇️ Arrow down icon
Success:     ✓ Checkmark
Error:       ⚠️ Warning triangle
Info:        ℹ️ Info circle
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

sm:   640px    @media (min-width: 640px)
md:   768px    @media (min-width: 768px)
lg:   1024px   @media (min-width: 1024px)
xl:   1280px   @media (min-width: 1280px)
2xl:  1536px   @media (min-width: 1536px)
```

### Responsive Patterns
```css
/* Stack on mobile, grid on desktop */
<div class="flex flex-col lg:grid lg:grid-cols-3">

/* Hide on mobile, show on desktop */
<span class="hidden sm:inline">

/* Full width mobile, contained desktop */
<div class="w-full lg:max-w-7xl">

/* Smaller text on mobile */
<h1 class="text-4xl md:text-6xl">
```

---

## Accessibility

### Focus Rings
```css
Default:     ring-2 ring-cyan-500
Offset:      ring-offset-2 ring-offset-slate-950
Keyboard:    focus-visible:ring-2
```

### Color Contrast
```css
Minimum:     4.5:1 for body text (WCAG AA)
Enhanced:    7:1 for headlines (WCAG AAA)
Large Text:  3:1 minimum (WCAG AA)
```

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Best Practices

### Do's ✓
- Use consistent spacing scale
- Apply proper color contrast
- Add focus states to all interactive elements
- Use semantic HTML
- Optimize for mobile first
- Include loading states
- Provide visual feedback
- Use gradients sparingly
- Maintain consistent border radius
- Apply shadows for elevation

### Don'ts ✗
- Mix different spacing systems
- Use pure black (#000000)
- Forget hover states
- Overuse animations
- Ignore accessibility
- Exceed 3 font weights
- Use more than 3 colors per component
- Nest gradients excessively
- Create inconsistent patterns
- Forget error states

---

## Testing Checklist

### Visual
- [ ] Colors meet contrast requirements
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent
- [ ] Shadows create proper depth
- [ ] Animations are smooth (60fps)
- [ ] Hover states are visible
- [ ] Focus states are clear

### Responsive
- [ ] Mobile (320px+) works
- [ ] Tablet (768px+) optimized
- [ ] Desktop (1024px+) polished
- [ ] Text scales appropriately
- [ ] Images are responsive
- [ ] Touch targets are 44px+

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus management correct
- [ ] Color not sole indicator
- [ ] Motion respects preferences
- [ ] ARIA labels where needed
- [ ] Semantic HTML used

### Performance
- [ ] Animations use transform/opacity
- [ ] GPU acceleration enabled
- [ ] No layout thrashing
- [ ] CSS is minified
- [ ] Critical CSS inlined
- [ ] Lazy loading implemented

---

**Design System Version**: 1.0.0  
**Last Updated**: 2026-02-01  
**Maintained by**: PDF Vault Team
