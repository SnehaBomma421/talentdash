import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-td-coral/50'

  const variantClasses = {
    primary: 'bg-td-coral text-white hover:bg-[#e04e52] disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-td-black text-white hover:bg-gray-800 disabled:bg-gray-300',
    outline: 'border-2 border-td-border bg-white text-td-body hover:bg-td-hover disabled:opacity-50',
    ghost: 'text-td-body hover:bg-td-hover disabled:opacity-50',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (href && !disabled) {
    return <Link href={href} className={classes}>{children}</Link>
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
