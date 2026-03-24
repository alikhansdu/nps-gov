interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data?: BarData[];
  maxValue?: number;
  color?: string;
  showValues?: boolean;
  showAxis?: boolean;
  height?: number;
}

const defaultData: BarData[] = [
  { label: "Jan", value: 99 },
  { label: "Feb", value: 72 },
  { label: "Mar", value: 85 },
  { label: "Apr", value: 60 },
  { label: "May", value: 91 },
  { label: "Jun", value: 78 },
  { label: "Jul", value: 55 },
  { label: "Aug", value: 88 },
];

export default function BarChart({
  data = defaultData,
  maxValue,
  color = "#00BCD4",
  showValues = true,
  showAxis = true,
  height = 120,
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-2">
      {data.map((bar, index) => {
        const barHeight = (bar.value / max) * height;

        return (
          <div key={index} className="flex flex-col items-center gap-1">
            {/* Value */}
            {showValues && (
              <span className="text-xs font-medium text-gray-700">
                {bar.value}
              </span>
            )}

            {/* Bar */}
            <div
              className="w-12 rounded-lg transition-all duration-300 hover:opacity-80"
              style={{
                height: `${barHeight}px`,
                backgroundColor: color,
              }}
            />

            {/* Axis label */}
            {showAxis && (
              <span className="text-xs text-gray-400">{bar.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
