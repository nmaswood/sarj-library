import React from "react";

interface ViewBookButtonProps {
  onClick: () => void;
}

const ViewBookButton: React.FC<ViewBookButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="view-book-button">
      View Book
    </button>
  );
};

export default ViewBookButton;
