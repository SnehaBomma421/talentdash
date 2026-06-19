import type { LevelEnum } from '@/types'

const levelBadgeColors: Record<LevelEnum, string> = {
  L3: 'bg-slate-100 text-slate-700',
  L4: 'bg-blue-100 text-blue-700',
  L5: 'bg-indigo-100 text-indigo-700',
  L6: 'bg-purple-100 text-purple-700',
  SDE_I: 'bg-slate-100 text-slate-700',
  SDE_II: 'bg-blue-100 text-blue-700',
  SDE_III: 'bg-indigo-100 text-indigo-700',
  STAFF: 'bg-purple-100 text-purple-700',
  PRINCIPAL: 'bg-[#1e3a5f] text-white',
  IC4: 'bg-teal-100 text-teal-700',
  IC5: 'bg-teal-100 text-teal-700',
}

interface BadgeProps {
  level: LevelEnum
  className?: string
}

export function Badge({ level, className = '' }: BadgeProps) {
  const colorClass = levelBadgeColors[level] || 'bg-gray-100 text-gray-700'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {level}
    </span>
  )
}
