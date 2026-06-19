'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/salary-utils'
import type { SalaryRecord, CompareResponse } from '@/types'

export function CompareWidget() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [records, setRecords] = useState<SalaryRecord[]>([])
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState(searchParams.get('s2') || '')
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available records for dropdowns
  useEffect(() => {
    fetch('/api/salaries?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data?.data) {
          const records = data.data
          setRecords(records)

          // Handle c1 param: pre-fill s1 with first record from that company
          const c1Slug = searchParams.get('c1')
          const s1Param = searchParams.get('s1')
          const s2Param = searchParams.get('s2')
          if (s1Param) {
            setS1(s1Param)
          } else if (c1Slug) {
            const match = records.find((r: SalaryRecord) => r.company.slug === c1Slug)
            if (match) {
              setS1(match.id)
              const params = new URLSearchParams(searchParams.toString())
              params.set('s1', match.id)
              params.delete('c1')
              window.history.replaceState(null, '', `/compare?${params.toString()}`)
              // If s2 is also set, trigger the comparison
              if (s2Param) {
                fetchCompare(match.id, s2Param)
              }
            }
          }
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCompare = async (id1: string, id2: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/compare?s1=${id1}&s2=${id2}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to load comparison')
        setCompareData(null)
        return
      }
      const data = await res.json()
      setCompareData(data)
    } catch {
      setError('Failed to load comparison')
      setCompareData(null)
    } finally {
      setLoading(false)
    }
  }

  // Load comparison from URL params on mount
  useEffect(() => {
    const id1 = searchParams.get('s1')
    const id2 = searchParams.get('s2')
    if (id1 && id2) {
      fetchCompare(id1, id2)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectRecord1 = (id: string) => {
    setS1(id)
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set('s1', id)
    else params.delete('s1')
    router.push(`/compare?${params.toString()}`, { scroll: false })
    if (id && s2) fetchCompare(id, s2)
  }

  const handleSelectRecord2 = (id: string) => {
    setS2(id)
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set('s2', id)
    else params.delete('s2')
    router.push(`/compare?${params.toString()}`, { scroll: false })
    if (id && s1) fetchCompare(s1, id)
  }

  const getOptionLabel = (r: SalaryRecord) =>
    `${r.company.name} · ${r.role} · ${r.level} · ${r.location} · ${formatCurrency(r.total_compensation, r.currency)}`

  return (
    <div>
      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-td-body mb-2">Select Record A</label>
          <select
            value={s1}
            onChange={(e) => handleSelectRecord1(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-td-border rounded-lg bg-white text-td-body focus:outline-none focus:ring-2 focus:ring-td-coral/50"
          >
            <option value="">Choose a salary record...</option>
            {records.map((r) => (
              <option key={r.id} value={r.id}>{getOptionLabel(r)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-td-body mb-2">Select Record B</label>
          <select
            value={s2}
            onChange={(e) => handleSelectRecord2(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-td-border rounded-lg bg-white text-td-body focus:outline-none focus:ring-2 focus:ring-td-coral/50"
          >
            <option value="">Choose a salary record...</option>
            {records.map((r) => (
              <option key={r.id} value={r.id}>{getOptionLabel(r)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-td-coral border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-td-muted mt-2">Loading comparison...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-td-error">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !compareData && !s1 && !s2 && (
        <EmptyState message="Select two salary records above to compare them." />
      )}

      {/* Comparison table */}
      {compareData && !loading && (
        <div className="bg-td-surface border border-td-border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-td-border bg-td-bg">
                <th className="text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider">Field</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider">Record A</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider">Record B</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-td-muted uppercase tracking-wider">Delta</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Company', renderA: () => compareData.record1.company.name, renderB: () => compareData.record2.company.name, delta: null },
                { label: 'Role', renderA: () => compareData.record1.role, renderB: () => compareData.record2.role, delta: null },
                { label: 'Level', renderA: () => <Badge level={compareData.record1.level} />, renderB: () => <Badge level={compareData.record2.level} />, delta: null },
                { label: 'Location', renderA: () => compareData.record1.location, renderB: () => compareData.record2.location, delta: null },
                { label: 'Experience', renderA: () => `${compareData.record1.experience_years} yrs`, renderB: () => `${compareData.record2.experience_years} yrs`, delta: { value: compareData.delta.experience_delta, unit: ' yrs' } },
                { label: 'Base Salary', renderA: () => formatCurrency(compareData.record1.base_salary, compareData.record1.currency), renderB: () => formatCurrency(compareData.record2.base_salary, compareData.record2.currency), delta: { value: compareData.delta.base_delta, unit: '' } },
                { label: 'Bonus', renderA: () => compareData.record1.bonus > 0 ? formatCurrency(compareData.record1.bonus, compareData.record1.currency) : '—', renderB: () => compareData.record2.bonus > 0 ? formatCurrency(compareData.record2.bonus, compareData.record2.currency) : '—', delta: { value: compareData.delta.bonus_delta, unit: '' } },
                { label: 'Stock', renderA: () => compareData.record1.stock > 0 ? formatCurrency(compareData.record1.stock, compareData.record1.currency) : '—', renderB: () => compareData.record2.stock > 0 ? formatCurrency(compareData.record2.stock, compareData.record2.currency) : '—', delta: { value: compareData.delta.stock_delta, unit: '' } },
                { label: 'Total Comp', renderA: () => <span className="text-base font-bold text-td-blue">{formatCurrency(compareData.record1.total_compensation, compareData.record1.currency)}</span>, renderB: () => <span className="text-base font-bold text-td-body">{formatCurrency(compareData.record2.total_compensation, compareData.record2.currency)}</span>, delta: { value: compareData.delta.tc_delta, unit: '', isTotalComp: true } },
              ].map((row, i) => (
                <tr key={i} className="border-b border-td-border hover:bg-td-hover transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-td-black">{row.label}</td>
                  <td className="py-3 px-4 text-sm text-td-body">
                    {row.renderA()}
                    {i === 8 && compareData.delta.tc_delta > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-td-blue">Higher TC</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-td-body">
                    {row.renderB()}
                    {i === 8 && compareData.delta.tc_delta < 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-td-blue">Higher TC</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {row.delta !== null ? (
                      <span className={
                        row.delta.value > 0
                          ? 'text-td-green font-medium'
                          : row.delta.value < 0
                          ? 'text-td-error font-medium'
                          : 'text-td-muted'
                      }>
                        {row.delta.value > 0 ? '+' : ''}{row.delta.value}{row.delta.unit}
                        {row.delta.isTotalComp && row.delta.value > 0 && (
                          <span className="block text-xs text-td-muted font-normal">Record A higher</span>
                        )}
                        {row.delta.isTotalComp && row.delta.value < 0 && (
                          <span className="block text-xs text-td-muted font-normal">Record B higher</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-td-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Two IDs selected but no data yet */}
      {!loading && !error && !compareData && s1 && s2 && (
        <EmptyState message="Could not load comparison data. Please try selecting different records." />
      )}
    </div>
  )
}
