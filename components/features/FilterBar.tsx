'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LEVELS } from '@/lib/constants'
import { debounce } from '@/lib/salary-utils'
import { Button } from '@/components/ui/Button'
import type { CurrencyEnum, LevelEnum } from '@/types'

interface FilterBarProps {
  availableRoles?: string[]
  availableLocations?: string[]
}

export function FilterBar({ availableRoles = [], availableLocations = [] }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [company, setCompany] = useState(searchParams.get('company') || '')
  const [role, setRole] = useState(searchParams.get('role') || '')
  const [selectedLevels, setSelectedLevels] = useState<LevelEnum[]>(() => {
    const levels = searchParams.get('level')
    return levels ? levels.split(',').filter((l): l is LevelEnum => LEVELS.includes(l as LevelEnum)) : []
  })
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [currency, setCurrency] = useState<CurrencyEnum>(
    (searchParams.get('currency') as CurrencyEnum) || 'INR'
  )

  // Build query string and update URL
  const updateURL = (overrides?: Record<string, string | undefined>) => {
    const params = new URLSearchParams()

    const c = overrides?.company !== undefined ? overrides.company : company
    const r = overrides?.role !== undefined ? overrides.role : role
    const lvls = overrides?.level !== undefined ? overrides.level : selectedLevels.join(',')
    const loc = overrides?.location !== undefined ? overrides.location : location
    const cur = overrides?.currency !== undefined ? overrides.currency : currency

    if (c) params.set('company', c)
    if (r) params.set('role', r)
    if (lvls) params.set('level', lvls)
    if (loc) params.set('location', loc)
    if (cur && cur !== 'INR') params.set('currency', cur)

    const qs = params.toString()
    router.push(qs ? `/salaries?${qs}` : '/salaries', { scroll: false })
  }

  // Debounced company search
  const debouncedUpdate = debounce((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('company', value)
    } else {
      params.delete('company')
    }
    params.delete('page')
    router.push(`/salaries?${params.toString()}`, { scroll: false })
  }, 300)

  const handleCompanyChange = (value: string) => {
    setCompany(value)
    debouncedUpdate(value)
  }

  const handleRoleChange = (value: string) => {
    setRole(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('role', value)
    } else {
      params.delete('role')
    }
    params.delete('page')
    router.push(`/salaries?${params.toString()}`, { scroll: false })
  }

  const handleLevelToggle = (level: LevelEnum) => {
    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter(l => l !== level)
      : [...selectedLevels, level]
    setSelectedLevels(newLevels)
    updateURL({ level: newLevels.join(',') })
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('location', value)
    } else {
      params.delete('location')
    }
    params.delete('page')
    router.push(`/salaries?${params.toString()}`, { scroll: false })
  }

  const handleCurrencyChange = (cur: CurrencyEnum) => {
    setCurrency(cur)
    const params = new URLSearchParams(searchParams.toString())
    if (cur && cur !== 'INR') {
      params.set('currency', cur)
    } else {
      params.delete('currency')
    }
    router.push(`/salaries?${params.toString()}`, { scroll: false })
  }

  const clearAll = () => {
    setCompany('')
    setRole('')
    setSelectedLevels([])
    setLocation('')
    setCurrency('INR')
    router.push('/salaries', { scroll: false })
  }

  const hasFilters = company || role || selectedLevels.length > 0 || location || currency !== 'INR'

  return (
    <div className="bg-td-surface border border-td-border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Company search */}
        <div>
          <label className="block text-xs font-medium text-td-muted mb-1">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => handleCompanyChange(e.target.value)}
            placeholder="Search company..."
            className="w-full px-3 py-2 text-sm border border-td-border rounded-lg focus:outline-none focus:ring-2 focus:ring-td-coral/50 focus:border-td-coral bg-white text-td-body placeholder:text-td-muted"
          />
        </div>

        {/* Role dropdown */}
        <div>
          <label className="block text-xs font-medium text-td-muted mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-td-border rounded-lg focus:outline-none focus:ring-2 focus:ring-td-coral/50 focus:border-td-coral bg-white text-td-body"
          >
            <option value="">All roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Location dropdown */}
        <div>
          <label className="block text-xs font-medium text-td-muted mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-td-border rounded-lg focus:outline-none focus:ring-2 focus:ring-td-coral/50 focus:border-td-coral bg-white text-td-body"
          >
            <option value="">All locations</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Currency toggle */}
        <div>
          <label className="block text-xs font-medium text-td-muted mb-1">Currency</label>
          <div className="flex gap-1 p-1 bg-td-bg rounded-lg">
            {(['INR', 'USD'] as CurrencyEnum[]).map((cur) => (
              <button
                key={cur}
                onClick={() => handleCurrencyChange(cur)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currency === cur
                    ? 'bg-white text-td-black shadow-sm'
                    : 'text-td-muted hover:text-td-body'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        {/* Clear button */}
        <div className="flex items-end">
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Level multi-select */}
      <div className="mt-3">
        <label className="block text-xs font-medium text-td-muted mb-2">Level</label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelToggle(level)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                selectedLevels.includes(level)
                  ? 'bg-td-coral text-white border-td-coral'
                  : 'bg-white text-td-body border-td-border hover:border-td-coral'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
