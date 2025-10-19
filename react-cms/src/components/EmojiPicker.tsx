import React from 'react';

// Common emojis for quick selection
const COMMON_EMOJIS = [
  '✨', '⚡', '🚀', '💎', '🎉', '🔥', '⭐', '💡',
  '🎯', '🌟', '💪', '🏆', '❤️', '👍', '✅', '🎨',
  '📱', '💻', '🌈', '🎁', '☕', '🍕', '🎵', '🎮',
  '🏃', '🌍', '🌙', '☀️', '⚽', '🎸', '📚', '🔧'
];

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  currentEmoji?: string;
  buttonClassName?: string;
  pickerClassName?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  currentEmoji = '',
  buttonClassName = 'absolute right-2 top-2 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors',
  pickerClassName = 'absolute z-10 mt-2 p-3 bg-white border-2 border-gray-300 rounded-lg shadow-xl grid grid-cols-8 gap-1'
}) => {
  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={pickerClassName} style={{ minWidth: '280px' }}>
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleSelect(emoji)}
          className={`w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors ${
            emoji === currentEmoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
          }`}
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

interface EmojiInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  buttonColor?: 'blue' | 'purple' | 'green' | 'red' | 'pink';
  disabled?: boolean;
}

export const EmojiInput: React.FC<EmojiInputProps> = ({
  value,
  onChange,
  label,
  placeholder = '✨',
  buttonColor = 'blue',
  disabled = false
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const buttonColors = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
    green: 'bg-green-50 hover:bg-green-100 text-green-600',
    red: 'bg-red-50 hover:bg-red-100 text-red-600',
    pink: 'bg-pink-50 hover:bg-pink-100 text-pink-600'
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all text-center text-2xl disabled:bg-gray-100 disabled:text-gray-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          disabled={disabled}
          className={`absolute right-2 top-2 px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonColors[buttonColor]}`}
        >
          Pick
        </button>
      </div>
      <EmojiPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectEmoji={onChange}
        currentEmoji={value}
      />
    </div>
  );
};
