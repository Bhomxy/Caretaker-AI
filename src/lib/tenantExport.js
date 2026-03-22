function csvEscape(value) {
  const s = String(value ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** CSV download for selected tenant rows (PRD §8.3 bulk export). */
export function exportTenantsCsv(rows) {
  const headers = [
    'Name',
    'Unit',
    'Property',
    'Service charge (annual)',
    'Status',
    'Complaints',
    'Phone',
  ]
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        csvEscape(r.name),
        csvEscape(r.unit),
        csvEscape(r.propertyName),
        csvEscape(r.serviceChargeAnnual ?? ''),
        csvEscape(r.statusKey),
        csvEscape(r.complaintsCount),
        csvEscape(r.phone),
      ].join(',')
    ),
  ]
  const blob = new Blob([lines.join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tenants-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
