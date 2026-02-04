# 🎨 Advanced Components & Patterns
*Premium UI Implementation Guide - Session 7*

---

## Table of Contents

1. [Glass Card Pattern](#glass-card-pattern)
2. [Gradient Buttons](#gradient-buttons)
3. [Loading States](#loading-states)
4. [Toast Notifications](#toast-notifications)
5. [Modal Dialog](#modal-dialog)
6. [Dropdown Menu](#dropdown-menu)
7. [Form Pattern](#form-pattern)
8. [List Components](#list-components)

---

## Glass Card Pattern

Glassmorphism effect for premium appearance:

```tsx
// Basic glass card
<div className="card card-glass">
  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
    Premium Card
  </h3>
  <p className="text-slate-600 dark:text-slate-400 mt-2">
    Content with glass effect
  </p>
</div>

// Advanced usage
<div className="card card-glass hover:shadow-lg transition-all duration-300">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-semibold">Balance</h4>
      <p className="text-2xl font-bold text-primary">₹45,000</p>
    </div>
    <div className="text-4xl">💰</div>
  </div>
</div>
```

**CSS Behind the Scenes:**
```css
.card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (prefers-color-scheme: dark) {
  .card-glass {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

---

## Gradient Buttons

Premium gradient button styles:

```tsx
// Primary gradient
<button className="btn btn-primary">
  Primary Action
</button>

// Success gradient
<button className="btn btn-success">
  Confirm
</button>

// Error gradient
<button className="btn btn-error">
  Delete
</button>

// Custom gradient with icon
<button className="btn btn-primary flex items-center gap-2">
  <span>✓</span>
  Confirm Payment
</button>

// Outlined gradient border
<button className="btn btn-outline border-2 hover:bg-primary/5">
  Explore
</button>
```

**Available Gradients:**
- Primary: #5b7fff → #818cf8
- Success: #22c55e → #86efac
- Error: #ef4444 → #f87171
- Warning: #f59e0b → #fcd34d

---

## Loading States

Professional loading indicators:

```tsx
// Loading button
<button className="btn btn-primary opacity-50 cursor-not-allowed">
  <span className="animate-spin">⏳</span>
  Processing...
</button>

// Loading skeleton
<div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-20 animate-pulse" />

// Full page loader
<div className="fixed inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
  <div className="text-center">
    <div className="text-4xl animate-bounce">💫</div>
    <p className="mt-2 text-slate-600">Loading...</p>
  </div>
</div>

// Loading card skeleton
<div className="card">
  <div className="bg-slate-200 dark:bg-slate-700 h-6 rounded w-2/3 animate-pulse" />
  <div className="bg-slate-200 dark:bg-slate-700 h-4 rounded w-full mt-4 animate-pulse" />
  <div className="bg-slate-200 dark:bg-slate-700 h-4 rounded w-5/6 mt-3 animate-pulse" />
</div>
```

---

## Toast Notifications

Alert/notification system:

```tsx
// Success toast
<div className="fixed bottom-4 right-4 bg-success/10 border border-success/20 rounded-lg p-4 backdrop-blur-sm">
  <div className="flex items-center gap-3">
    <span className="text-success text-xl">✓</span>
    <div>
      <p className="font-semibold text-slate-900 dark:text-slate-50">Success</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">Transaction completed</p>
    </div>
  </div>
</div>

// Error toast
<div className="fixed bottom-4 right-4 bg-error/10 border border-error/20 rounded-lg p-4 backdrop-blur-sm">
  <div className="flex items-center gap-3">
    <span className="text-error text-xl">✕</span>
    <div>
      <p className="font-semibold">Error</p>
      <p className="text-sm">Something went wrong</p>
    </div>
  </div>
</div>

// Info toast
<div className="fixed bottom-4 right-4 bg-info/10 border border-info/20 rounded-lg p-4 backdrop-blur-sm">
  <div className="flex items-center gap-3">
    <span className="text-info text-xl">ℹ️</span>
    <div>
      <p className="font-semibold">Info</p>
      <p className="text-sm">New feature available</p>
    </div>
  </div>
</div>
```

---

## Modal Dialog

Premium modal/dialog pattern:

```tsx
// Modal wrapper
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
    {/* Modal content */}
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
        Confirm Action
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Are you sure you want to proceed?
      </p>
    </div>
    
    {/* Modal footer */}
    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
      <button className="btn btn-secondary flex-1">Cancel</button>
      <button className="btn btn-primary flex-1">Confirm</button>
    </div>
  </div>
</div>
```

---

## Dropdown Menu

Premium dropdown pattern:

```tsx
<div className="relative group">
  {/* Trigger */}
  <button className="btn btn-secondary flex items-center gap-2">
    More
    <span>▼</span>
  </button>
  
  {/* Menu - shown on hover */}
  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
    <a href="#" className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg">
      Edit
    </a>
    <a href="#" className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
      Delete
    </a>
    <a href="#" className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 last:rounded-b-lg">
      Settings
    </a>
  </div>
</div>
```

---

## Form Pattern

Complete form with validation:

```tsx
<form className="space-y-4">
  {/* Text Input */}
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      Email Address
    </label>
    <input
      type="email"
      className="input"
      placeholder="user@example.com"
    />
    <p className="text-xs text-slate-500 mt-1">We'll never share your email</p>
  </div>

  {/* Select Input */}
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      Category
    </label>
    <select className="input">
      <option>Food & Dining</option>
      <option>Transport</option>
      <option>Entertainment</option>
    </select>
  </div>

  {/* Textarea */}
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      Notes
    </label>
    <textarea
      className="input resize-none"
      rows={4}
      placeholder="Additional details..."
    />
  </div>

  {/* Checkbox */}
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" className="w-4 h-4 rounded" />
    <span className="text-sm text-slate-700 dark:text-slate-300">
      I agree to the terms
    </span>
  </label>

  {/* Submit */}
  <button type="submit" className="btn btn-primary w-full">
    Submit Form
  </button>
</form>
```

---

## List Components

Premium list patterns:

```tsx
// Simple list
<div className="space-y-2">
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
    <span className="font-medium">Item Name</span>
    <span className="text-slate-600">₹1,000</span>
  </div>
</div>

// List with avatars
<div className="space-y-3">
  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
      👤
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">John Doe</p>
      <p className="text-sm text-slate-600">2 hours ago</p>
    </div>
    <span className="font-semibold text-primary">₹500</span>
  </div>
</div>

// List with actions
<div className="space-y-2 divide-y divide-slate-200 dark:divide-slate-700">
  <div className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors">
    <div>
      <p className="font-medium">Payment processed</p>
      <p className="text-sm text-slate-600">Jan 31, 2026</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="badge badge-success">Completed</span>
      <button className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-900 transition-all">
        ⋯
      </button>
    </div>
  </div>
</div>
```

---

## Responsive Grid

Adaptive grid layouts:

```tsx
// 4-column on desktop, 2 on tablet, 1 on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  <Card variant="glass">Content</Card>
  <Card variant="glass">Content</Card>
  <Card variant="glass">Content</Card>
  <Card variant="glass">Content</Card>
</div>

// 3-column on desktop, 2 on tablet, 1 on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  <Card>Content</Card>
  <Card>Content</Card>
  <Card>Content</Card>
</div>
```

---

## Dark Mode Toggle

Implement theme switching:

```tsx
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(isDarkMode);
    applyTheme(isDarkMode);
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(dark));
  };

  return (
    <button
      onClick={() => {
        setIsDark(!isDark);
        applyTheme(!isDark);
      }}
      className="btn btn-secondary"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

---

## Animation Examples

```tsx
// Fade in on mount
<div className="animate-fade-in">
  Content fades in
</div>

// Slide up with delay
<div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
  Content slides up
</div>

// Scale in with bounce
<div className="animate-scale-in">
  Content scales in
</div>

// Infinite pulse
<div className="animate-pulse">
  Pulsing content
</div>

// Custom animation chain
<div className="animate-fade-in animate-slide-up">
  Multiple animations
</div>
```

---

## Implementation Checklist

- [ ] Add gradient buttons to all CTAs
- [ ] Replace cards with card-glass variants
- [ ] Implement loading states
- [ ] Add toast notifications
- [ ] Create modal dialogs
- [ ] Build dropdown menus
- [ ] Redesign forms
- [ ] Update lists with hover states
- [ ] Test dark mode across all components
- [ ] Verify animations on mobile
- [ ] Test accessibility features

---

Generated: January 31, 2026
Version: 1.0.0
