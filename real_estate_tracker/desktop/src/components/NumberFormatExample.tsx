// NumberFormatExample.tsx - Shows how numbers are formatted in the dashboard

// Number formatting utilities (same as in Dashboard)
const formatLargeNumber = (amount: number): string => {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return millions >= 10
      ? `$${millions.toFixed(0)}M`
      : `$${millions.toFixed(1)}M`;
  } else if (amount >= 100000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else if (amount >= 10000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
};

export default function NumberFormatExample() {
  const examples = [
    { raw: 500, formatted: formatLargeNumber(500) },
    { raw: 1500, formatted: formatLargeNumber(1500) },
    { raw: 15000, formatted: formatLargeNumber(15000) },
    { raw: 150000, formatted: formatLargeNumber(150000) },
    { raw: 1500000, formatted: formatLargeNumber(1500000) },
    { raw: 15000000, formatted: formatLargeNumber(15000000) },
    { raw: 1200000, formatted: formatLargeNumber(1200000) }, // Your specific example
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        📊 Number Formatting Examples
      </h3>
      <div className="space-y-2">
        {examples.map(({ raw, formatted }, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {raw.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatted}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✨ Improvements:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>
            • <strong>$1,200,000</strong> now shows as <strong>$1.2M</strong>{" "}
            instead of <strong>$1200K</strong>
          </li>
          <li>
            • Consistent precision: whole numbers for large amounts, decimals
            for clarity
          </li>
          <li>• Smart breakpoints: $150K, $15.0K, $1.5K based on size</li>
          <li>• Compact display preserves space while improving readability</li>
        </ul>
      </div>
    </div>
  );
}
