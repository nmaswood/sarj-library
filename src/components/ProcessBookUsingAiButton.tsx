import React from "react";

interface ProcessBookUsingAiButtonProp {
  onClick: () => void;
  isLoading: boolean;
}

const ProcessBookUsingAiButton: React.FC<ProcessBookUsingAiButtonProp> = ({ onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`get-book-button ${isLoading ? "disabled-button" : ""}`}
    >
      {isLoading ? "Loading..." : "Process book text again"}
    </button>
  );
};

export default ProcessBookUsingAiButton;
