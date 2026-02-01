/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive))',
          foreground: 'oklch(var(--destructive-foreground))',
        },
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
        },
        column: {
          DEFAULT: 'oklch(var(--column))',
          header: 'oklch(var(--column-header))',
        },
        success: {
          DEFAULT: 'oklch(var(--success))',
          foreground: 'oklch(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'oklch(var(--warning))',
          foreground: 'oklch(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'oklch(var(--info))',
          foreground: 'oklch(var(--info-foreground))',
        },
        priority: {
          critical: 'oklch(var(--priority-critical))',
          'critical-bg': 'oklch(var(--priority-critical-bg))',
          high: 'oklch(var(--priority-high))',
          'high-bg': 'oklch(var(--priority-high-bg))',
          medium: 'oklch(var(--priority-medium))',
          'medium-bg': 'oklch(var(--priority-medium-bg))',
          low: 'oklch(var(--priority-low))',
          'low-bg': 'oklch(var(--priority-low-bg))',
        },
        status: {
          todo: 'oklch(var(--status-todo))',
          progress: 'oklch(var(--status-progress))',
          done: 'oklch(var(--status-done))',
          blocked: 'oklch(var(--status-blocked))',
        },
        surface: {
          base: 'oklch(var(--surface-base))',
          elevated: 'oklch(var(--surface-elevated))',
          sunken: 'oklch(var(--surface-sunken))',
          overlay: 'oklch(var(--surface-overlay))',
        },
        state: {
          hover: 'oklch(var(--state-hover))',
          active: 'oklch(var(--state-active))',
          focus: 'oklch(var(--state-focus))',
          selected: 'oklch(var(--state-selected))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
