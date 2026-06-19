import { Badge } from '@/components/ui/Badge'
import type { SalaryRecord } from '@/types'
import { formatCurrency } from '@/lib/salary-utils'

interface SortConfig {
  key: string
  label: string
  sortUrl: string // URL to toggle sort for this column
}

interface SalaryTableProps {
  salaries: SalaryRecord[]
  currentSort?: string
  sortableColumns?: SortConfig[]
}

export function SalaryTable({ salaries, currentSort, sortableColumns }: SalaryTableProps) {
  if (!salaries || salaries.length === 0) {
    return null
  }

  const renderSortIndicator = (key: string) => {
    if (!currentSort) return null
    if (currentSort === `${key}_desc`) return <span className="ml-1 text-td-coral">↓</span>
    if (currentSort === `${key}_asc`) return <span className="ml-1 text-td-coral">↑</span>
    return null
  }

  const renderHeader = (sortKey: string | null, label: string, defaultClassName: string) => {
    if (sortKey && sortableColumns) {
      const config = sortableColumns.find(s => s.key === sortKey)
      if (config) {
        return (
          <th className={defaultClassName}>
            <a
              href={config.sortUrl}
              className="inline-flex items-center hover:text-td-black transition-colors"
            >
              {label}
              {renderSortIndicator(sortKey)}
            </a>
          </th>
        )
      }
    }
    return <th className={defaultClassName}>{label}</th>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-td-border">
            {renderHeader('company', 'Company', 'text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider')}
            {renderHeader('role', 'Role', 'text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider')}
            {renderHeader('level', 'Level', 'text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider')}
            {renderHeader('location', 'Location', 'text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider')}
            {renderHeader('experience', 'Experience', 'text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider')}
            {renderHeader('base', 'Base', 'text-right py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider')}
            {renderHeader('stock', 'Stock', 'text-right py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider')}
            {renderHeader('total_comp', 'Total Comp', 'text-right py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider text-td-blue')}
          </tr>
        </thead>
        <tbody>
          {salaries.map((salary) => (
            <tr
              key={salary.id}
              className="border-b border-td-border hover:bg-td-hover transition-colors"
            >
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-td-black truncate max-w-[120px] block" title={salary.company.name}>
                  {salary.company.name}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-td-body truncate max-w-[200px] block" title={salary.role}>
                  {salary.role}
                </span>
              </td>
              <td className="py-3 px-4">
                <Badge level={salary.level} />
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-td-body">{salary.location}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-td-body">{salary.experience_years} yr{salary.experience_years !== 1 ? 's' : ''}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-sm text-td-body">{formatCurrency(salary.base_salary, salary.currency)}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-sm text-td-body">
                  {salary.stock > 0 ? formatCurrency(salary.stock, salary.currency) : '—'}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-base font-bold text-td-blue">
                  {formatCurrency(salary.total_compensation, salary.currency)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
