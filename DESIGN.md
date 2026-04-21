# Design System Document

## 1. Overview & Creative North Star: "The Culinary Editorial"

This design system is built to move away from the generic "fast-food grid" and toward a high-end, editorial experience. Our Creative North Star is **The Culinary Editorial**. We treat pizza not just as a commodity, but as a hero. By combining the high-impact energy of a fashion magazine with the warmth of a premium kitchen, we create an environment that feels both "hot" and sophisticated.

The system breaks traditional digital boundaries through:
*   **Intentional Asymmetry:** Overlapping high-quality food photography across container edges.
*   **Tonal Depth:** Replacing harsh lines with sophisticated surface layering.
*   **Kinetic Typography:** Using extreme scale shifts to create a sense of urgency and freshness.

---

## 2. Color Strategy: Heat and Earth

The palette is anchored in a "Rich Red" that signifies heat and speed, balanced by a sophisticated "Off-white" cream base that feels organic and premium.

### Palette Highlights
*   **Primary (`#B91C1C`):** Our signature "Heat." Use this for high-conversion CTAs and brand moments.
*   **Secondary (`#855300` / `#FEA619`):** Representing the "Golden Crust." Used for accentuation and nutritional callouts.
*   **Surface Hierarchy:** We utilize `surface-container` tiers to create depth without clutter.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for defining sections. Boundaries must be established through:
1.  **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
2.  **Tonal Transitions:** Subtle shifts between cream and light grey to guide the eye.

### The "Glass & Gradient" Rule
To elevate the UI beyond a standard template, use **Glassmorphism** for floating navigation and cart overlays. 
*   **Formula:** `surface` color at 70% opacity + 12px Backdrop Blur.
*   **Signature Textures:** Apply a subtle linear gradient (Primary to Primary-Container) on main buttons to add "soul" and mimic the shimmer of fresh ingredients.

---

## 3. Typography: The Bold and the Fluid

Our typography pairing balances the "Fast/Hot" personality with "Friendly/Clean" legibility.

| Level | Token | Font | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Epilogue | 3.5rem | Bold | Heroic headlines, "Pizza Hót" moments. |
| **Headline** | `headline-md` | Epilogue | 1.75rem | Bold | Section headers, product categories. |
| **Title** | `title-md` | Plus Jakarta | 1.125rem | Medium | Product names, card titles. |
| **Body** | `body-lg` | Plus Jakarta | 1rem | Regular | Descriptions and editorial content. |
| **Label** | `label-md` | Plus Jakarta | 0.75rem | Bold | Price tags, nutritional badges. |

**Editorial Note:** Use `display` styles with tight letter-spacing (-2%) to create a modern, high-impact "street-style" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering

We avoid the "pasted-on" look of traditional material design. Depth is achieved through physical layering principles.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on a `surface-container-low` background. This creates a natural, soft "lift" that feels like paper on a stone countertop.
*   **Ambient Shadows:** If a floating element (like a mobile FAB) is required, use a shadow with a 24px blur and 4% opacity. The shadow color must be a dark red-tinted brown (derived from `on-surface`) rather than pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` at 15% opacity. Never use a 100% opaque border.
*   **Glassmorphism:** Use semi-transparent layers for the "Order Tracker" or "Cart Summary" to allow the vibrant food photography to bleed through, keeping the experience integrated.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background with a subtle gradient to `primary-container`. `rounded-xl` (1.5rem) or `full`.
*   **Secondary:** `secondary-container` (Golden) with `on-secondary-container` text. Use for "Add to Cart" to differentiate from the main checkout flow.
*   **Tertiary:** No background. Use `title-sm` with a small `primary` icon.

### Cards (The "Hero" Card)
*   **Style:** No borders. Background: `surface-container-lowest`.
*   **Image Treatment:** Pizza photography should "break the box," partially overlapping the top or side of the card to create a 3D, appetising effect.
*   **Spacing:** Use `lg` (1rem) internal padding.

### Chips
*   **Selection:** Used for toppings. Unselected: `surface-container-high`. Selected: `primary` with `on-primary` text.
*   **Shape:** Always `full` roundedness.

### Input Fields
*   **Style:** `surface-container-highest` background. No border.
*   **Focus State:** A 2px "Ghost Border" of `primary` at 20% opacity.
*   **Typography:** Use `body-md` for user input.

### Lists & Dividers
*   **Constraint:** Dividers are forbidden. Separate list items (like cart items) using `surface-container-low` background strips or generous vertical white space from our spacing scale.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use high-saturation food photography with warm lighting.
*   **Do** use asymmetrical layouts where images bleed off the edge of the screen.
*   **Do** use `epilogue` for all price points to make them feel bold and urgent.
*   **Do** lean into white space—let the "Cream" background breathe.

### Don’t
*   **Don't** use 1px solid black or grey borders.
*   **Don't** use standard "Drop Shadows" (0, 2, 4, etc.). Keep blurs large and opacities low.
*   **Don't** crowd the UI. If a section feels tight, increase the background tonal contrast instead of adding lines.
*   **Don't** use cold colors. Avoid blues or harsh greens; stick to the "Heat and Earth" palette.

---

## 7. Spacing & Roundedness Scale

*   **Roundedness:** Use `xl` (1.5rem) for main containers and `full` for interactive elements like buttons and chips.
*   **Spacing:** Follow a 4px baseline grid. Preferred increments for section gaps are `2rem` (32px) and `4rem` (64px) to maintain the high-end editorial feel.