import { ResponsiveContainer, FunnelChart as RechartsFunnelChart, Funnel, Cell } from "recharts"

interface FunnelChartProps {
  data?: Array<{ id: string; value: number; fill?: string }>
}

export function FunnelChart({ data = [] }: FunnelChartProps) {
  const defaultData = [
    { id: "Started", value: 1000, fill: "#3b82f6" },
    { id: "Step 1", value: 800, fill: "#6366f1" },
    { id: "Step 2", value: 600, fill: "#8b5cf6" },
    { id: "Completed", value: 400, fill: "#a855f7" },
  ]

  const chartData = data.length > 0 ? data : defaultData

  return (
    <div style={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsFunnelChart>
          <Funnel dataKey="value" data={chartData} isAnimationActive>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || "#3b82f6"} />
            ))}
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FunnelChart // Add default export for flexibility
