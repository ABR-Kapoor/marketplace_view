# AuraSutra Healthcare Platform - Theme Documentation

## 🎨 Color Palette

### Primary Colors (Healthcare Green)
```css
Primary: #10B981 (Emerald Green)
├── 50:  #F0FDF4 (Lightest)
├── 100: #DCFCE7
├── 200: #BBF7D0
├── 300: #86EFAC
├── 400: #4ADE80
├── 500: #10B981 (Base)
├── 600: #059669
├── 700: #047857
├── 800: #065F46
└── 900: #064E3B (Darkest)
```

### Secondary Colors
```css
Secondary: #34D399 (Light Emerald)
├── 300: #6EE7B7
└── 400: #34D399
```

### Status Colors
```css
Success:   #10B981 (Green)
Error:     #EF4444 (Red)
Warning:   #F59E0B (Amber)
Info:      #3B82F6 (Blue)
```

### Appointment Status Colors
```css
Confirmed: #10B981 (Green)
Pending:   #EAB308 (Yellow)
Cancelled: #EF4444 (Red)
Completed: #3B82F6 (Blue)
```

### Health-Specific Colors
```css
Health Primary:   #10B981 (Green)
Health Secondary: #F59E0B (Amber)
Health Accent:    #3B82F6 (Blue)
```

## 📝 Typography

### Font Families
```css
Primary Font: 'Poppins', sans-serif
Hindi Font:   'Noto Sans Devanagari', sans-serif
Brand Font:   'Alatsi', sans-serif (for logo)
```

### Font Weights (Poppins)
- Thin: 100
- Extra Light: 200
- Light: 300
- Regular: 400
- Medium: 500
- Semi Bold: 600
- Bold: 700
- Extra Bold: 800
- Black: 900

## 🎭 CSS Variables (HSL Format)

### Light Mode
```css
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 142.1 76.2% 36.3%
--primary-foreground: 0 0% 100%
--secondary: 210 40% 96.1%
--secondary-foreground: 222.2 47.4% 11.2%
--muted: 210 40% 96.1%
--muted-foreground: 215.4 16.3% 46.9%
--accent: 210 40% 96.1%
--accent-foreground: 222.2 47.4% 11.2%
--destructive: 0 84.2% 60.2%
--destructive-foreground: 210 40% 98%
--border: 214.3 31.8% 91.4%
--input: 214.3 31.8% 91.4%
--ring: 142.1 76.2% 36.3%
--radius: 1rem
```

### Dark Mode
```css
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--primary: 142.1 76.2% 36.3%
--primary-foreground: 222.2 47.4% 11.2%
--secondary: 217.2 32.6% 17.5%
--secondary-foreground: 210 40% 98%
--muted: 217.2 32.6% 17.5%
--muted-foreground: 215 20.2% 65.1%
--accent: 217.2 32.6% 17.5%
--accent-foreground: 210 40% 98%
--destructive: 0 62.8% 30.6%
--destructive-foreground: 210 40% 98%
--border: 217.2 32.6% 17.5%
--input: 217.2 32.6% 17.5%
--ring: 142.1 76.2% 36.3%
```

## 🎬 Animations

### Keyframe Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Shimmer Effect */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

/* Levitate */
@keyframes levitate {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* Pulse Primary */
@keyframes pulse-primary {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); 
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); 
  }
}

/* Scale In */
@keyframes scale-in {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Accordion Down */
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

/* Accordion Up */
@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

/* Slide Up */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Animation Classes
```css
.animate-fadeIn          /* fadeIn 0.4s ease-out forwards */
.animate-pulse-primary   /* pulse-primary 2s infinite ease-in-out */
.animate-scale-in        /* scale-in 0.2s ease-out */
.animate-fade-in         /* fade-in 0.4s ease-out forwards */
.animate-slide-up        /* slide-up 0.5s ease-out forwards */
.animate-accordion-down  /* accordion-down 0.2s ease-out */
.animate-accordion-up    /* accordion-up 0.2s ease-out */
.skeleton                /* shimmer 2s infinite linear */
.levitating-card         /* levitate 4s ease-in-out infinite */
```

## 🎨 Component Styles

### Glass Morphism Cards
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease-in-out;
}

.glass-card-hover {
  /* Extends glass-card with hover effects */
  hover:shadow-green-200/50
  hover:shadow-xl
  hover:scale-[1.01]
  hover:-translate-y-1
}
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(to right, #059669, #10B981);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 900;
}
```

### Primary Button
```css
.btn-primary {
  background: linear-gradient(to right, #10B981, #10B981);
  color: white;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(to right, #059669, #059669);
  box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.3);
  transform: scale(1.02);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

### Smooth Transitions
```css
.smooth-transition {
  transition: all 0.3s ease-in-out;
}
```

### Focus Ring
```css
.focus-ring {
  outline: none;
  ring: 2px solid #10B981;
  ring-offset: 2px;
}
```

## 📦 Box Shadows

### Green-Themed Shadows
```css
shadow-green-sm:  0 2px 4px 0 rgba(16, 185, 129, 0.1)
shadow-green-md:  0 4px 6px -1px rgba(16, 185, 129, 0.1), 
                  0 2px 4px -1px rgba(16, 185, 129, 0.06)
shadow-green-lg:  0 10px 15px -3px rgba(16, 185, 129, 0.1), 
                  0 4px 6px -2px rgba(16, 185, 129, 0.05)
shadow-green-xl:  0 20px 25px -5px rgba(16, 185, 129, 0.2), 
                  0 10px 10px -5px rgba(16, 185, 129, 0.04)
```

## 🎯 Border Radius

```css
--radius: 1rem (16px)
border-radius-lg: 1rem
border-radius-md: 0.875rem (14px)
border-radius-sm: 0.75rem (12px)
```

## 🖱️ Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #BBF7D0; /* primary-200 */
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #86EFAC; /* primary-300 */
}
```

## 🌐 Background

```css
body {
  background-image: url('/health_tech_bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
```

## 📱 Responsive Breakpoints

```css
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1400px (custom)
```

## 🎨 Usage Examples

### Card with Hover Effect
```jsx
<div className="glass-card-hover p-6 rounded-2xl">
  <h3 className="gradient-text text-2xl mb-4">Healthcare Card</h3>
  <p className="text-gray-600">Content here</p>
</div>
```

### Primary Button
```jsx
<button className="btn-primary">
  Book Appointment
</button>
```

### Animated Element
```jsx
<div className="animate-fadeIn levitating-card">
  <p>Floating content</p>
</div>
```

### Status Badge
```jsx
<span className="px-3 py-1 bg-status-success/10 text-status-success rounded-full text-sm font-semibold">
  Confirmed
</span>
```

## 🎭 Design Principles

1. **Healthcare-First**: Green color palette conveys health, growth, and wellness
2. **Glass Morphism**: Modern, clean aesthetic with transparency effects
3. **Smooth Animations**: Subtle transitions enhance user experience
4. **Accessibility**: High contrast ratios and clear typography
5. **Responsive**: Mobile-first design with fluid layouts
6. **Consistent Spacing**: 4px base unit for padding/margins
7. **Rounded Corners**: Soft, friendly appearance with 1rem base radius

## 🔧 Customization

To modify the theme:

1. **Colors**: Edit `tailwind.config.ts` → `theme.extend.colors`
2. **Animations**: Add keyframes in `app/globals.css`
3. **Components**: Update utility classes in `@layer components`
4. **CSS Variables**: Modify `:root` in `app/globals.css`

## 📚 Dependencies

- **Tailwind CSS**: v3.4.0
- **tailwindcss-animate**: v1.0.7
- **Google Fonts**: Poppins, Noto Sans Devanagari, Alatsi
