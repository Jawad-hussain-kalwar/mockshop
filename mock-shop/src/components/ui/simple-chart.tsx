"use client"

interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  type: 'bar' | 'line' | 'pie'
  title?: string
  height?: number
}

export function SimpleChart({ data, type, title, height = 200 }: SimpleChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  if (type === 'bar') {
    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg">{title}</h3>}
        <div className="space-y-2" style={{ height }}>
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || colors[index % colors.length],
                    minWidth: item.value > 0 ? '20px' : '0px'
                  }}
                >
                  {item.value > 0 && (
                    <span className="text-white text-xs">
                      {typeof item.value === 'number' && item.value % 1 !== 0 
                        ? item.value.toFixed(1) 
                        : item.value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'line') {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((item.value / maxValue) * 80) // 80% of height for padding
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg">{title}</h3>}
        <div className="relative" style={{ height }}>
          <svg width="100%" height="100%" className="border rounded">
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={points}
              vectorEffect="non-scaling-stroke"
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((item.value / maxValue) * 80)
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#3B82F6"
                />
              )
            })}
          </svg>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            {data.map((item, index) => (
              <span key={index} className="truncate max-w-16">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    return (
      <div className="space-y-4">
        {title && <h3 className="font-semibold text-lg">{title}</h3>}
        <div className="flex items-center gap-6">
          <div className="relative" style={{ width: height, height }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const angle = (percentage / 100) * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                
                const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180)
                const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180)
                const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180)
                const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180)
                
                const largeArcFlag = angle > 180 ? 1 : 0
                
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ')
                
                currentAngle += angle
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color || colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="1"
                  />
                )
              })}
            </svg>
          </div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                />
                <span className="text-gray-700">
                  {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}