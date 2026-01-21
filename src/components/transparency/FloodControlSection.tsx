import { ChevronDown, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import floodData from '../../data/transparency/flood-control.json';
// 1. Import the new chart component
import FloodControlChart from './FloodControlChart';

export default function FloodControlSection() {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    return floodData.projects.filter((p) => {
      const matchSearch =
        !search ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.contractor.toLowerCase().includes(search.toLowerCase());
      const matchYear = !yearFilter || p.year === Number(yearFilter);
      const matchType = !typeFilter || p.type === typeFilter;
      return matchSearch && matchYear && matchType;
    });
  }, [search, yearFilter, typeFilter]);

  const filteredStats = useMemo(() => {
    const uniqueContractors = new Set(filtered.map((p) => p.contractor)).size;

    return {
      count: filtered.length,
      cost: filtered.reduce((s, p) => s + p.cost, 0),
      contractors: uniqueContractors,
    };
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="bg-primary-50 rounded-lg p-2 sm:p-3">
          <p className="text-xs text-primary-600">Projects</p>
          <p className="text-lg sm:text-xl font-bold text-primary-700">
            {filteredStats.count}
          </p>
        </div>
        <div className="bg-primary-50 rounded-lg p-2 sm:p-3">
          <p className="text-xs text-primary-600">Total Cost</p>
          <p className="text-lg sm:text-xl font-bold text-primary-700">
            ₱{(filteredStats.cost / 1e9).toFixed(1)}B
          </p>
        </div>
        <div className="bg-primary-50 rounded-lg p-2 sm:p-3">
          <p className="text-xs text-primary-600">Contractors</p>
          <p className="text-lg sm:text-xl font-bold text-primary-700">
            {floodData.stats.contractors}
          </p>
        </div>
      </div>

      {/* 2. Insert the Chart here */}
      <FloodControlChart />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Years</option>
            {floodData.filters.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            {floodData.filters.types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-600">
                  Year
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">
                  Project
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-600 hidden sm:table-cell">
                  Type
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">
                  Cost
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-600 hidden md:table-cell">
                  Contractor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900">{p.year}</td>
                  <td className="py-2 px-3 text-gray-700">{p.description}</td>
                  <td className="py-2 px-3 text-gray-600 hidden sm:table-cell">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        p.type === 'Drainage'
                          ? 'bg-blue-100 text-blue-700'
                          : p.type === 'Revetment'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                    ₱{(p.cost / 1e6).toFixed(1)}M
                  </td>
                  <td className="py-2 px-3 text-gray-600 hidden md:table-cell truncate max-w-[200px]">
                    {p.contractor}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-2 pt-2">
        <a
          href="https://www.bettergov.ph/flood-control-projects?deo=Bacolod+City+District+Engineering+Office"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
        >
          View on BetterGov <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href="https://visualizations.bettergov.ph/map?deo=Bacolod+City+District+Engineering+Office"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-primary-600 text-primary-600 rounded text-sm hover:bg-primary-50"
        >
          View Map <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <p className="text-xs text-gray-500 pt-2">
        Source:{' '}
        <a
          href="https://dpwhinfra.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          DPWH Flood Control Information System
        </a>{' '}
        via{' '}
        <a
          href="https://bettergov.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          BetterGov.ph
        </a>{' '}
        • Report issues:{' '}
        <a
          href="https://sumbongsapangulo.ph/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          sumbongsapangulo.ph
        </a>
      </p>
    </div>
  );
}
