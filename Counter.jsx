import { Minus, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";

const Counter = ({ isFullWidth, handleClick, counter, value, disable }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      setInputValue(newValue);
    } else if (e.target.value === "") {
      setInputValue(""); // Allow clearing the input temporarily
    }
  };

  const handleInputBlur = () => {
    if (inputValue === "" || isNaN(inputValue)) {
      setInputValue(value); // Reset to the current value if invalid input
    } else {
      handleClick(counter, inputValue); // Sync the updated value with the parent
    }
  };

  const handlePlus = () => {
    handleClick(counter, "increment");
    setInputValue((prev) => prev + 1); // Update local state
  };

  const handleMinus = () => {
    handleClick(counter, "decrement");
    setInputValue((prev) => Math.max(0, prev - 1)); // Update local state
  };

  return (
    <div className="Examcounter" style={isFullWidth && { width: "100%" }}>
      <button
        className="counterIconWrapper"
        onClick={handleMinus}
        disabled={disable}
      >
        <Minus />
      </button>
      <input
        type="number"
        className="fw-bold fs-5 text-center"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disable}
        min={0}
        style={{ width: "60px" }}
      />
      <button
        className="counterIconWrapper"
        onClick={handlePlus}
        disabled={disable}
      >
        <Plus />
      </button>
    </div>
  );
};

export default Counter;
