# 🎬 Advanced Effects Quick Reference Guide

## Animation Classes - Quick Lookup

### Scroll Reveal (Entry Animations)
```tsx
.scroll-reveal         // fadeInUp (0.8s)
.scroll-reveal-left    // slideInLeft (0.8s)
.scroll-reveal-right   // slideInRight (0.8s)
.scroll-reveal-scale   // scaleIn (0.8s)
.scroll-reveal-rotate  // rotateIn (0.8s)
.scroll-reveal-blur    // blurReveal (1s)
.scroll-reveal-down    // slideInDown (0.8s)
```

### Infinite Effects
```tsx
.pulse-effect          // pulse (2s infinite)
.shimmer-effect        // shimmer (3s infinite)
.neon-glow             // neon glow (2s infinite)
.bounce-animation      // bounce (1s infinite)
.spin-animation        // spin 360° (2s infinite)
.wiggle-animation      // wiggle (0.5s)
.gradient-shift        // gradient shift (6s infinite)
.float-animation       // float up (3s infinite)
.glow-effect           // glow (2s infinite)
```

### Advanced Effects
```tsx
.particle-float        // float up and fade (2s)
.wave-effect           // wave sweep (1.5s infinite)
.morphing-shape        // shape morphing (4s infinite)
.float-rotate          // float + rotate (3s infinite)
.liquid-swing          // swinging motion (2s infinite)
.chromatic-effect      // color aberration (1.5s infinite)
.data-glow             // data pulsing (2s infinite)
.scan-line-effect      // scanning line (3s infinite)
.aurora-bg             // aurora gradient (6s infinite)
```

## Card & Container Classes

### Standard Card (Most Used)
```tsx
<div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
  {content}
</div>
```

**What it does:**
- scroll-reveal: Animates in when visible
- card-3d: 3D perspective transform on hover
- glass-effect: Glassmorphism with blur
- rounded-xl: Border radius 12px
- p-6: Padding 24px
- hover-lift: Elevates on hover
- group: Parent for group-hover effects

### Button with Effects
```tsx
<button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 font-semibold group">
  <Icon className="group-hover:rotate-180 transition-transform duration-300" />
  <span>Action</span>
</button>
```

### Input with Effects
```tsx
<input
  type="text"
  className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 hover:border-slate-500"
/>
```

## Stagger Animation (Lists)

```tsx
{items.map((item, index) => (
  <div 
    key={item.id} 
    className="stagger-item" 
    style={{animationDelay: `${index * 0.08}s`}}
  >
    {content}
  </div>
))}
```

**Common delay values:**
- 0.05s - Fast stagger
- 0.08s - Medium stagger
- 0.1s - Standard stagger
- 0.15s - Slow stagger

## Icon Animations

```tsx
// Rotate on hover
<Icon className="group-hover:rotate-180 transition-transform duration-300" />

// Scale on hover
<Icon className="group-hover:scale-125 transition-transform duration-300" />

// Color change on hover
<Icon className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />

// Combined
<Icon className="group-hover:rotate-180 group-hover:scale-110 transition-all duration-300" />
```

## Color Classes

### Text Colors
```
Primary:   text-white
Secondary: text-slate-100
Tertiary:  text-slate-300
Label:     text-slate-400
Disabled:  text-slate-500
```

### Background Colors
```
Container:    bg-slate-800 / bg-slate-700/50
Input:        bg-slate-700/50
Hover:        hover:bg-indigo-500/20
Success:      bg-green-500/20
Error:        bg-red-500/20
Warning:      bg-amber-500/20
```

### Text Accent Colors
```
Success:   text-green-400
Error:     text-red-400
Warning:   text-amber-400
Info:      text-blue-400
Primary:   text-indigo-400
Secondary: text-cyan-400
```

## Hover Effects

```
.hover-lift         // Elevate + shadow
.group-hover:*      // Child effects on parent hover
.transition-all     // Smooth all property changes
.duration-300       // 0.3s timing (standard)
.hover:scale-105    // Scale 5% larger
.hover:scale-110    // Scale 10% larger
.hover:scale-125    // Scale 25% larger
.hover:rotate-180   // Rotate 180°
.hover:bg-opacity-80  // Change opacity
```

## Spacing Quick Reference

```
p-6              // Padding 24px all sides
px-6 py-3        // Padding 24px horizontal, 12px vertical
gap-6            // Gap 24px between items
space-y-3        // Vertical spacing 12px
space-y-4        // Vertical spacing 16px
space-x-3        // Horizontal spacing 12px
```

## Border & Radius

```
rounded-lg       // 8px border radius
rounded-xl       // 12px border radius
border           // 1px solid border
border-slate-600 // Dark gray border
border border-slate-700/50  // Semi-transparent border
```

## Shadow Effects

```
shadow-lg        // Standard shadow
shadow-lg shadow-indigo-500/30     // Colored shadow
hover:shadow-lg hover:shadow-indigo-500/30  // On hover
```

## Common Patterns

### Hero Card
```tsx
<div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
  <h2 className="text-3xl font-bold text-white mb-2">Title</h2>
  <p className="text-slate-400">Subtitle</p>
</div>
```

### List Item with Stagger
```tsx
<div className="stagger-item flex items-center justify-between p-4 glass-effect rounded-lg hover-lift group" 
  style={{animationDelay: `${index * 0.08}s`}}>
  <span className="text-white">{content}</span>
  <Icon className="group-hover:scale-110 transition-transform" />
</div>
```

### Stat Card with Icon
```tsx
<div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-slate-400">Label</p>
      <p className="text-3xl font-bold text-white">Value</p>
    </div>
    <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30">
      <Icon className="text-green-400" />
    </div>
  </div>
</div>
```

### Progress Bar
```tsx
<div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
  <div className="h-3 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
    style={{width: `${percentage}%`}} />
</div>
```

---

## Performance Tips

1. Use `group` class on parent for `group-hover` effects
2. Apply `transition-all duration-300` for smooth effects
3. Use `will-change: transform` on animated elements
4. Stagger delays: multiply index by 0.08-0.1s
5. Limit backdrop-filter to necessary elements
6. Use `scale-105/110` instead of large transforms
7. Keep animation durations under 1s for interactions
8. Use `ease-out` for entry, `ease-in-out` for loops

---

## Browser Compatibility Check

✅ Chrome 90+
✅ Safari 15+
✅ Firefox 89+
✅ Edge 90+
✅ Mobile browsers

**Note:** backdrop-filter requires modern browser support
(Graceful fallback: semi-transparent background without blur)

---

**Last Updated:** Session 8e
**Quality:** Production Ready ✅
