interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

export function DashboardCard({
  title,
  description,
  buttonText,
  onClick,
}: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
}
