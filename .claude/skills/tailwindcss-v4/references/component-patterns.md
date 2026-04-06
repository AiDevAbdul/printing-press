# Component Patterns for Tailwind v4

Production-ready component examples using Tailwind v4 CSS-first configuration.

## Pattern 1: Button Component

```tsx
// src/components/Button.tsx
import { ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className = ''
}: ButtonProps) {
  const baseStyles = `
    font-medium rounded-lg transition-all duration-300
    focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantStyles = {
    primary: `
      bg-primary text-white
      hover:opacity-90
      dark:bg-dark-accent dark:hover:opacity-90
    `,
    secondary: `
      border-2 border-primary text-primary
      hover:bg-primary hover:text-white
      dark:border-dark-accent dark:text-dark-accent
      dark:hover:bg-dark-accent dark:hover:text-white
    `,
    ghost: `
      text-primary hover:bg-primary hover:bg-opacity-10
      dark:text-dark-accent dark:hover:bg-dark-accent dark:hover:bg-opacity-10
    `
  }

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
```

**Usage**:
```tsx
<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary" size="lg">Secondary</Button>
<Button variant="ghost" disabled>Disabled</Button>
```

## Pattern 2: Card Component

```tsx
// src/components/Card.tsx
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div
      className={`
        rounded-lg border p-6
        bg-light-bg-secondary dark:bg-dark-bg-secondary
        border-light-border dark:border-dark-border
        transition-all duration-300
        ${hoverable ? 'hover:border-primary dark:hover:border-dark-accent hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

**Usage**:
```tsx
<Card hoverable>
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-text-secondary dark:text-dark-text-secondary">Content</p>
</Card>
```

## Pattern 3: Input Component

```tsx
// src/components/Input.tsx
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-text dark:text-dark-text">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border
          bg-light-bg-secondary dark:bg-dark-bg-secondary
          border-light-border dark:border-dark-border
          text-text dark:text-dark-text
          placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary
          focus:border-primary dark:focus:border-dark-accent
          focus:ring-2 focus:ring-primary dark:focus:ring-dark-accent
          focus:ring-opacity-50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error focus:border-error focus:ring-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-text-tertiary dark:text-dark-text-tertiary mt-1">
          {helperText}
        </p>
      )}
    </div>
  )
}
```

**Usage**:
```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={emailError}
  helperText="We'll never share your email"
/>
```

## Pattern 4: Badge Component

```tsx
// src/components/Badge.tsx
import { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-primary text-white dark:bg-dark-accent',
    secondary: 'bg-secondary text-white dark:bg-purple-600',
    success: 'bg-success text-white dark:bg-green-600',
    warning: 'bg-warning text-white dark:bg-amber-600',
    error: 'bg-error text-white dark:bg-red-600'
  }

  return (
    <span
      className={`
        inline-block px-3 py-1 rounded-full text-sm font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
```

**Usage**:
```tsx
<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="error">Error</Badge>
```

## Pattern 5: Grid Layout

```tsx
// src/components/Grid.tsx
import { ReactNode } from 'react'

interface GridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Grid({
  children,
  cols = 3,
  gap = 'md',
  className = ''
}: GridProps) {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }

  const gapMap = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  return (
    <div className={`grid ${colsMap[cols]} ${gapMap[gap]} ${className}`}>
      {children}
    </div>
  )
}
```

**Usage**:
```tsx
<Grid cols={3} gap="lg">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

## Pattern 6: Modal Component

```tsx
// src/components/Modal.tsx
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-light-bg dark:bg-dark-bg rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        {title && (
          <div className="border-b border-light-border dark:border-dark-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text dark:text-dark-text">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 text-text dark:text-dark-text">
          {children}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
```

**Usage**:
```tsx
const [isOpen, setIsOpen] = useState(false)

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
  Are you sure?
</Modal>
```

## Pattern 7: Navbar Component

```tsx
// src/components/Navbar.tsx
import Link from 'next/link'
import { ReactNode } from 'react'

interface NavbarProps {
  logo?: ReactNode
  links: Array<{ href: string; label: string }>
  actions?: ReactNode
}

export function Navbar({ logo, links, actions }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        {logo && <div className="font-bold text-lg">{logo}</div>}

        {/* Links */}
        <div className="hidden md:flex gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        {actions && <div className="flex gap-4">{actions}</div>}
      </div>
    </nav>
  )
}
```

**Usage**:
```tsx
<Navbar
  logo="Logo"
  links={[
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' }
  ]}
  actions={<Button>Sign In</Button>}
/>
```

## Pattern 8: Form Component

```tsx
// src/components/Form.tsx
import { FormEvent, ReactNode } from 'react'

interface FormProps {
  onSubmit: (e: FormEvent) => void
  children: ReactNode
  className?: string
}

export function Form({ onSubmit, children, className = '' }: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 ${className}`}
    >
      {children}
    </form>
  )
}
```

**Usage**:
```tsx
<Form onSubmit={handleSubmit}>
  <Input label="Name" name="name" required />
  <Input label="Email" type="email" name="email" required />
  <Button type="submit">Submit</Button>
</Form>
```

## Pattern 9: Alert Component

```tsx
// src/components/Alert.tsx
import { ReactNode } from 'react'

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  children: ReactNode
  onClose?: () => void
}

export function Alert({ type = 'info', children, onClose }: AlertProps) {
  const typeStyles = {
    info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100',
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100',
    warning: 'bg-amber-50 dark:bg-amber-900 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-100',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100'
  }

  return (
    <div className={`border rounded-lg p-4 flex items-start justify-between ${typeStyles[type]}`}>
      <div>{children}</div>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold">
          ✕
        </button>
      )}
    </div>
  )
}
```

**Usage**:
```tsx
<Alert type="success">Operation completed successfully!</Alert>
<Alert type="error" onClose={() => setError(null)}>Error message</Alert>
```

## Pattern 10: Skeleton Loader

```tsx
// src/components/Skeleton.tsx
interface SkeletonProps {
  width?: string
  height?: string
  className?: string
}

export function Skeleton({ width = 'w-full', height = 'h-4', className = '' }: SkeletonProps) {
  return (
    <div
      className={`
        ${width} ${height}
        bg-light-bg-tertiary dark:bg-dark-bg-tertiary
        rounded-lg
        animate-pulse
        ${className}
      `}
    />
  )
}
```

**Usage**:
```tsx
<div className="space-y-4">
  <Skeleton height="h-8" />
  <Skeleton height="h-4" />
  <Skeleton height="h-4" width="w-3/4" />
</div>
```
