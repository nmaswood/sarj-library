import React from "react";

interface GetBookButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const GetBookButton: React.FC<GetBookButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`get-book-button ${isLoading ? "disabled-button" : ""}`}
    >
      {isLoading ? "Loading..." : "Get the Book"}
    </button>
  );
};

export default GetBookButton;
