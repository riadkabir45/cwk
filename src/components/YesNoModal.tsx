import React from 'react';

interface YesNoModalProps {
  open: boolean;
  message: string;
  onYes: () => void;
  onNo: () => void;
  yesLabel?: string;
  noLabel?: string;
  color?: 'red' | 'yellow' | 'indigo' | 'green';
}

const colorMap = {
  red: 'bg-red-600',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-600',
  green: 'bg-green-600',
};

const YesNoModal: React.FC<YesNoModalProps> = ({
  open,
  message,
  onYes,
  onNo,
  yesLabel = 'Yes',
  noLabel = 'No',
  color = 'indigo',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className={`rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center ${colorMap[color]} text-white animate-pulse`}>
        <div className="text-xl font-bold mb-6 text-center">{message}</div>
        <div className="flex gap-6">
          <button
            className="px-6 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-100 transition"
            onClick={onYes}
          >
            {yesLabel}
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            onClick={onNo}
          >
            {noLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YesNoModal;