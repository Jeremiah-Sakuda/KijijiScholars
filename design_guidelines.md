# Kijiji Scholars Web App - Design Guidelines

## Design Approach

**Reference-Based Approach** drawing inspiration from:
- **Notion** - Clean information architecture, organized content hierarchy
- **Duolingo** - Gamification and motivational progress tracking
- **Khan Academy** - Educational content presentation, accessibility
- **Linear** - Modern typography, refined spacing, professional polish

These references align with the platform's dual needs: building trust through professionalism while maintaining an encouraging, accessible experience for students navigating a complex process.

### Core Design Principles
1. **Empowering Clarity**: Every interface element should reduce anxiety and build confidence
2. **Guided Journey**: Linear progression with clear next steps, avoiding overwhelming choices
3. **Cultural Resonance**: Professional global aesthetic with warmth that feels familiar to Kenyan students
4. **Mobile Bandwidth Optimization**: Fast-loading, efficient design for smartphone access

---

## Typography

**Primary Font**: Inter (Google Fonts) - Clean, highly legible, excellent for both display and body text
**Secondary Font**: Poppins (Google Fonts) - Friendly, rounded for headings and gamification elements

### Typography Scale
- **Hero Headlines**: Poppins Bold, 48px (mobile: 32px) - Main landing page headlines
- **Section Headers**: Poppins SemiBold, 36px (mobile: 24px) - Dashboard sections, major content areas
- **Subsection Headers**: Inter SemiBold, 24px (mobile: 20px) - Cards, module titles
- **Body Large**: Inter Regular, 18px - Feature descriptions, important content
- **Body Regular**: Inter Regular, 16px - Standard content, forms
- **Body Small**: Inter Regular, 14px - Supporting text, metadata
- **Caption**: Inter Medium, 12px - Labels, timestamps, badges

### Hierarchy Implementation
- Headings establish clear content structure
- Generous line-height (1.6 for body, 1.3 for headings) enhances readability
- Letter-spacing: -0.02em for large headings, default for body
- Limit line length to 65-75 characters for optimal reading

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 8, 12, 16, 24
- **Micro spacing** (p-2, gap-2): Related inline elements, icon-text pairs
- **Component padding** (p-4, p-8): Cards, buttons, input fields
- **Section spacing** (py-12, py-16, py-24): Vertical rhythm between content sections
- **Container margins** (mx-4, md:mx-8, lg:mx-16): Responsive page margins

### Grid Structure
- **Desktop**: max-w-7xl container with 12-column grid
- **Tablet**: max-w-4xl, 8-column grid
- **Mobile**: Full-width with px-4 margins, single-column stack

### Responsive Breakpoints
- Mobile-first approach: base (320px+), sm (640px+), md (768px+), lg (1024px+), xl (1280px+)
- Critical content always visible without horizontal scroll
- Touch targets minimum 44px for mobile interactions

---

## Component Library

### Navigation
**Primary Navigation** (Dashboard):
- Persistent sidebar (desktop) collapsing to bottom tab bar (mobile)
- Icons + labels for main sections: Dashboard, Roadmap, Essay Lab, Universities, Resources
- Active state: subtle background highlight, primary accent indicator
- Profile avatar with dropdown menu in top-right

**Marketing Header**:
- Clean, minimal header with logo left, navigation center, CTA right
- Sticky on scroll with subtle shadow
- Hamburger menu for mobile with full-screen overlay navigation

### Cards & Content Blocks
**Progress Cards**:
- White background, rounded corners (rounded-xl), subtle shadow
- Icon or progress indicator at top
- Title + description + action button
- Completion percentage or milestone badges

**Resource Cards**:
- Compact design with thumbnail/icon left
- Title, brief description, category tag
- Hover lift effect (subtle translate-y)

**Step Cards** (Roadmap):
- Numbered or iconographic indicator
- Title, checklist items, resources
- Expandable accordion for detailed content
- Visual connection lines between steps

### Forms & Inputs
**Text Inputs**:
- Height: h-12, rounded-lg borders
- Focus state: ring effect in primary color
- Helper text below in caption size
- Error states: red border + error message

**Buttons**:
- Primary: Solid fill, medium rounded (rounded-lg), px-8 py-3
- Secondary: Outlined with border
- Tertiary: Text-only with hover underline
- Disabled: Reduced opacity (0.5)
- Loading states: Spinner + "Processing..." text

**Select Dropdowns**:
- Custom styled matching input height
- Clear visual hierarchy in dropdown options
- Search functionality for long lists (university matcher)

### Data Visualization
**Progress Bars**:
- Segmented for multi-step processes
- Percentage display
- Color transitions from neutral to success green
- Labels for each segment

**Calendar/Timeline**:
- Monthly view with deadline markers
- Color-coded by priority (red: urgent, yellow: upcoming, green: completed)
- Click to see deadline details

**Achievement Badges**:
- Circular design with icon + label
- Unlock animations (subtle scale + fade)
- Tooltip showing achievement criteria

### Modals & Overlays
**Modal Dialogs**:
- Centered overlay with backdrop blur
- Max-width constrained (max-w-2xl)
- Clear close button (top-right X)
- Focused actions at bottom (Cancel + Primary)

**Toast Notifications**:
- Top-right positioning
- Auto-dismiss after 4 seconds
- Success (green), Error (red), Info (blue), Warning (yellow)
- Icon + message + close button

### AI Essay Lab Interface
**Essay Editor**:
- Split-pane layout: Writing area (left), AI feedback (right, collapsible on mobile)
- Clean writing canvas with minimal distractions
- Word count, version history indicators
- Inline suggestions with hover explanations
- Revision comparison slider

---

## Animations

**Purposeful Motion Only**:
- **Page transitions**: Subtle fade (150ms)
- **Button interactions**: Scale on press (95% scale, 100ms)
- **Card hovers**: Lift effect (translateY -2px, 200ms ease-out)
- **Progress updates**: Smooth bar fills (500ms ease-in-out)
- **Achievement unlocks**: Scale + fade-in (300ms) - celebrate milestones
- **No**: Parallax, continuous animations, decorative motion

---

## Images

### Hero Section
**Large hero image**: Yes, on marketing/landing page
- Full-width hero with inspirational image of Kenyan students studying/celebrating
- Overlay with gradient (dark bottom to transparent top) for text legibility
- CTAs with blurred background (backdrop-blur-md) for visibility

### Supporting Images
**University showcase**: Card thumbnails of campus photos (aspect-ratio 16:9)
**Success stories**: Student testimonial photos (circular avatars, 80x80px)
**Resource illustrations**: Custom icons for each application phase
**Dashboard empty states**: Friendly illustrations encouraging first steps

---

## Mobile-First Specific Optimizations

- Collapsible navigation to bottom tab bar
- Single-column layouts for all content sections
- Larger touch targets (min 44px height)
- Simplified forms with one input per row
- Lazy-load images below fold
- Optimized image formats (WebP with fallbacks)
- Progressive disclosure: Show critical info first, expandable sections for details

---

## Gamification Elements

**Visual Treatment**:
- Badge system: Colorful, celebratory but not childish
- Progress rings: Clean circular progress indicators
- Streak counters: Motivational without being stressful
- Level indicators: Subtle visual progression
- Confetti effects: Sparingly for major milestones only

---

## Cultural Considerations

- Professional color palette that works globally while feeling optimistic
- English-first with subtle Swahili phrases in encouragements ("Hongera!" for achievements)
- Imagery representing Kenyan students authentically
- Time/date formats considering both Kenyan and U.S. contexts
- Currency displays in both KSH and USD where relevant