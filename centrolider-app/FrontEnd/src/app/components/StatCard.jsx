export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor,
  onClick,
}) {
  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-6 transition-all ${
        onClick
          ? "cursor-pointer hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 active:scale-[0.98]"
          : "hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mb-2">{value}</p>
          {change && (
            <span className={`text-sm px-2 py-1 rounded-md ${changeColors[changeType]}`}>
              {change}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
