import React from "react";
import GetBookButton from "./GetBookButton";
import ViewBookButton from "./ViewBookButton";
import ProcessBookUsingAiButton from "./ProcessBookUsingAiButton";

interface ActionButtonsProps {
  isBookDownloaded: boolean;
  onGetBook: () => void;
  onViewBook: () => void;
  onProccessBookClicked: ()=>void
  isLoading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isBookDownloaded,
  onGetBook,
  onViewBook,
  onProccessBookClicked,
  isLoading,
}) => {
  return (
    <div className="action-buttons">
      {!isBookDownloaded ? (
        <GetBookButton onClick={onGetBook} isLoading={isLoading} />
      ) : (
        <>
          <ViewBookButton onClick={onViewBook} />
          {" "}
          <ProcessBookUsingAiButton  onClick={onProccessBookClicked} isLoading={isLoading}/>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
