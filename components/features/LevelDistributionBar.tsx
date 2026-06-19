import type { LevelEnum } from '@/types'
import { LEVELS } from '@/lib/constants'

const levelBarColors: Record<LevelEnum, string> = {
  L3: 'bg-slate-400',
  L4: 'bg-blue-400',
  L5: 'bg-indigo-400',
  L6: 'bg-purple-400',
  SDE_I: 'bg-slate-400',
  SDE_II: 'bg-blue-400',
  SDE_III: 'bg-indigo-400',
  STAFF: 'bg-purple-400',
  PRINCIPAL: 'bg-[#1e3a5f]',
  IC4: 'bg-teal-400',
  IC5: 'bg-teal-500',
}

interface LevelDistributionBarProps {
  distribution: Record<string, number>
  total: number
}

export function LevelDistributionBar({ distribution, total }: LevelDistributionBarProps) {
  if (total === 0) return null

  return (
    <div className="w-full">
      <div className="flex h-8 rounded-lg overflow-hidden">
        {LEVELS.map((level) => {
          const count = distribution[level] || 0
          if (count === 0) return null
          const percentage = (count / total) * 100
          const colorClass = levelBarColors[level] || 'bg-gray-400'
          return (
            <div
              key={level}
              className={`${colorClass} flex items-center justify-center text-xs font-medium text-white transition-all`}
              style={{ width: `${percentage}%`, minWidth: percentage > 8 ? undefined : '0' }}
              title={`${level}: ${count} records (${percentage.toFixed(1)}%)`}
            >
              {percentage > 8 ? `${level} (${count})` : null}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {LEVELS.map((level) => {
          const count = distribution[level] || 0
          if (count === 0) return null
          const percentage = (count / total) * 100
          const colorClass = levelBarColors[level] || 'bg-gray-400'
          return (
            <div key={level} className="flex items-center gap-1.5 text-xs text-td-muted">
              <span className={`w-2.5 h-2.5 rounded ${colorClass}`} />
              <span>{level}: {count} ({percentage.toFixed(0)}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
