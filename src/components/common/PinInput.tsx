import React from 'react';

interface PinInputProps {
  pins: string[];
  setPins: (pins: string[]) => void;
  disabled?: boolean;
  id?: string; // Add unique identifier prop
}

export const PinInput: React.FC<PinInputProps> = ({ 
  pins, 
  setPins, 
  disabled = false,
  id = 'pin' // Default fallback
}) => {
  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPins = [...pins];
      newPins[index] = value;
      setPins(newPins);
      
      if (value && index < 3) {
        const nextInput = document.getElementById(`${id}-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      const prevInput = document.getElementById(`${id}-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center my-6">
      {pins.map((pin, index) => (
        <input
          key={index}
          id={`${id}-${index}`}
          type="password"
          value={pin}
          onChange={(e) => handlePinChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:bg-gray-100"
          maxLength={1}
          placeholder="•"
        />
      ))}
    </div>
  );
};