# Attio Design System Research & Lottie Animation Resources

## 1. Attio Design System Visual Traits

Based on analysis of Attio's landing page (attio.com), here are the key visual design characteristics:

### Border Radius
- **Cards & Containers**: Moderate border radius (approximately 8-12px) for a modern, approachable feel
- **Buttons**: Rounded corners with consistent radius (approximately 6-8px)
- **UI Elements**: Subtle rounding on interactive elements for a polished, contemporary look
- **Overall Style**: Clean, geometric shapes with softened edges (not sharp corners, but not overly rounded)

### Typography
- **Font Family**: Modern sans-serif (appears to be Inter or similar geometric sans-serif)
- **Headings**: 
  - Large, bold headings with strong hierarchy
  - Hero text uses large sizes (48px+) with tight letter spacing
  - Section headings are prominent but not overwhelming
- **Body Text**: 
  - Clean, readable body copy with comfortable line height
  - Medium weight (400-500) for body text
  - Generous spacing between paragraphs
- **Text Style**: Minimal, professional typography with excellent readability
- **Color Contrast**: High contrast text on light backgrounds for accessibility

### Shadow Depth
- **Cards & Containers**: Subtle, soft shadows (very light elevation)
- **Depth Levels**: 
  - Minimal shadows for most elements (almost flat design with slight depth)
  - Hover states may have slightly more pronounced shadows
  - Overall: Very restrained use of shadows, maintaining a clean, modern aesthetic
- **Shadow Style**: Soft, diffused shadows rather than harsh, defined ones

### Spacing
- **Section Spacing**: Generous vertical spacing between sections (80-120px)
- **Component Spacing**: Consistent internal spacing within components (16-24px)
- **Grid System**: Clean, structured layout with consistent margins and padding
- **Whitespace**: Ample whitespace used strategically to create visual breathing room
- **Overall**: Spacious, uncluttered layout that feels premium and professional

### Overall Design Philosophy
- **Minimal & Clean**: Very clean interface with minimal visual noise
- **Modern SaaS Aesthetic**: Professional, trustworthy, and approachable
- **Light & Airy**: Light color palette with plenty of whitespace
- **Subtle Interactions**: Refined hover states and transitions
- **Data-Focused**: UI elements support data visualization and CRM functionality

---

## 2. Free Lottie Animation JSON URLs

### Coding/Programming Animations

1. **Example Coding Animation** (from LottieFiles CDN):
   ```
   https://assets4.lottiefiles.com/packages/lf20_32NcN8.json
   ```

2. **General Pattern for LottieFiles Animations**:
   - Format: `https://assets[1-5].lottiefiles.com/packages/lf20_[ID].json`
   - Or: `https://assets[1-5].lottiefiles.com/packages/lf30_[ID].json`
   - Browse free animations at: `https://lottiefiles.com/free-animations/coding`

### AI Assistant/Chatbot Animations

1. **AI Chatbot Animation** (from LottieFiles):
   ```
   https://lottiefiles.com/free-animation/voice-assistant-ai-chatbot-TU0uS5jXMP
   ```
   - Direct JSON URL can be obtained from the animation page
   - Browse more at: `https://lottiefiles.com/free-animations/ai-assistant`

2. **General Pattern**:
   - Browse free AI animations at: `https://lottiefiles.com/free-animations/ai-chatbot`
   - Each animation page provides direct JSON download and CDN URLs

### How to Get More URLs

1. Visit `https://lottiefiles.com/free-animations/` and search for:
   - "coding" or "programming" for coding-related animations
   - "ai assistant" or "chatbot" for AI-related animations

2. Each animation page provides:
   - Direct JSON download
   - CDN URL for embedding
   - Web player code snippet

3. **Recommended Approach**: 
   - Browse the free animations library
   - Select 2-3 animations that match your needs
   - Copy the CDN URL from each animation's page
   - Example CDN URL format: `https://assets3.lottiefiles.com/packages/lf20_[animation-id].json`

---

## 3. Light Mode Color Palette & Component Styles Summary

### Color Palette (Light Mode)

Based on Attio's design system:

#### Primary Colors
- **Background**: Pure white (#FFFFFF) or very light gray (#FAFAFA)
- **Primary Text**: Dark gray/charcoal (#1A1A1A or #2D2D2D)
- **Secondary Text**: Medium gray (#6B6B6B or #8B8B8B)
- **Accent/CTA**: Likely a vibrant blue or purple (common in modern SaaS)
- **Borders**: Very light gray (#E5E5E5 or #F0F0F0)

#### Semantic Colors
- **Success**: Green tones (subtle, not overly bright)
- **Warning**: Amber/yellow tones
- **Error**: Red tones (restrained, professional)
- **Info**: Blue tones

#### UI Element Colors
- **Cards**: White background with subtle borders or shadows
- **Buttons**: 
  - Primary: Solid accent color with white text
  - Secondary: Light background with border
  - Ghost: Transparent with text color
- **Inputs**: White background with light borders, subtle focus states

### Component Styles

#### Buttons
- **Border Radius**: 6-8px (moderate rounding)
- **Padding**: Generous (12-16px vertical, 24-32px horizontal)
- **Typography**: Medium weight (500-600), clear hierarchy
- **Shadows**: Minimal or none (flat design with subtle elevation on hover)
- **States**: Smooth transitions, subtle hover effects

#### Cards/Containers
- **Background**: White (#FFFFFF)
- **Border**: Very light gray (#E5E5E5) or subtle shadow
- **Border Radius**: 8-12px
- **Padding**: 24-32px internal spacing
- **Shadow**: Very subtle (if any) - almost flat design

#### Typography Scale
- **H1/Hero**: 48-64px, bold (700), tight letter spacing
- **H2**: 32-40px, bold (600-700)
- **H3**: 24-28px, semibold (600)
- **Body**: 16px, regular (400-500), line-height ~1.6
- **Small**: 14px, regular (400)

#### Input Fields
- **Border**: Light gray (#E5E5E5)
- **Border Radius**: 6-8px
- **Focus State**: Accent color border, subtle shadow
- **Background**: White
- **Padding**: 12-16px

#### Spacing System
- **Base Unit**: Likely 4px or 8px grid
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **XL**: 32px
- **XXL**: 48px
- **Section Spacing**: 80-120px

### Design Principles
1. **Minimalism**: Clean, uncluttered interfaces
2. **Consistency**: Uniform spacing, typography, and component styles
3. **Accessibility**: High contrast ratios, readable fonts
4. **Modern**: Contemporary design patterns, subtle animations
5. **Professional**: Trustworthy, polished aesthetic suitable for B2B SaaS

---

## Implementation Notes

### For Your Project
- Use a 4px or 8px spacing grid for consistency
- Implement subtle border radius (6-12px range)
- Use minimal shadows or flat design approach
- Ensure generous whitespace between sections
- Choose a modern sans-serif font (Inter, System UI, or similar)
- Maintain high contrast for text readability
- Use restrained color palette with one primary accent color

### Lottie Integration
- Use `lottie-player` web component or React Lottie libraries
- Load animations from LottieFiles CDN URLs
- Ensure animations are lightweight and performant
- Consider lazy loading for below-the-fold animations
