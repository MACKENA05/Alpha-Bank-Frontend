import React, { useRef, useEffect } from 'react';

interface PinInputProps {
  pins: string[];
  setPins: (pins: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export const PinInput: React.FC<PinInputProps> = ({ 
  pins, 
  setPins, 
  disabled = false,
  className = ""
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPins = [...pins];
    newPins[index] = value;
    setPins(newPins);

    // Auto-focus to next input if value is entered
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!pins[index] && index > 0) {
        // If current field is empty, move to previous field and clear it
        const newPins = [...pins];
        newPins[index - 1] = '';
        setPins(newPins);
        inputRefs.current[index - 1]?.focus();
      } else if (pins[index]) {
        // If current field has value, just clear it
        const newPins = [...pins];
        newPins[index] = '';
        setPins(newPins);
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    
    if (pastedData.length > 0) {
      const newPins = ['', '', '', ''];
      for (let i = 0; i < Math.min(pastedData.length, 4); i++) {
        newPins[i] = pastedData[i];
      }
      setPins(newPins);
      
      // Focus on the next empty field or the last field
      const nextIndex = Math.min(pastedData.length, 3);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select all text when focusing
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      {pins.map((pin, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className="w-14 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          maxLength={1}
          autoComplete="off"
        />
      ))}
    </div>
  );
};