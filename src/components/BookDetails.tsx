import React, { useState, useEffect } from "react";
import { useDownloadBook } from "../hooks/useDownloadBook";
import { useSaveBook } from "../hooks/useSaveBook";
import useBookContent from '../hooks/useBookContent';
import BookMetadata from "./BookMetadata";
import ActionButtons from "./ActionButtons";
import Modal from "./Modal";
import useBookAnalysisAPI from "../hooks/useBookAnalysis"; // Import the custom hook
import {Book} from './BooksList';

interface BookDetailsProps {
  book: Book;
  onBookSaved: (book: Book) => void;
  onClose: () => void;
  onBookProcessed: ()=> void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, onBookSaved, onClose, onBookProcessed }) => {
  const [isBookDownloaded, setIsBookDownloaded] = useState(book.local);
  const [showModal, setShowModal] = useState(false);
  const { content, isLoading, error, fetchBookContent } = useBookContent();
  const { downloadBook, isDownloading, error: downloadError } = useDownloadBook();
  const { saveBook, isSaving, error: saveError } = useSaveBook();

  // Use the custom hook for book analysis
  const { data, loading, error: analysisError, fetchBookAnalysis } = useBookAnalysisAPI(book.id);

  useEffect(() => {
    setIsBookDownloaded(book.local);
  }, [book]);

  const handleGetBook = async () => {
    const content = await downloadBook(book.id, book.title);
    if (!content) return;
    const success = await saveBook(book);
    if (success) {
      setIsBookDownloaded(true);
      onBookSaved(book);
     const res = fetchBookAnalysis(); 
     res.then(()=>onBookProcessed());
    }
  };

  const handleViewBook = async () => {
    await fetchBookContent(book.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleProcessClicked = ()=>{
    const res = fetchBookAnalysis(); 
    res.then(()=>onBookProcessed());
  }

  return (
    <div className="book-details">
      <button className="close-button" onClick={onClose}>
        &times; 
      </button>

      <ActionButtons
        isBookDownloaded={isBookDownloaded ?? false}
        onGetBook={handleGetBook}
        onViewBook={handleViewBook}
        onProccessBookClicked={handleProcessClicked}
        isLoading={isDownloading || isSaving}
      />
      {downloadError && <p className="error-msg">{downloadError}</p>}
      {saveError && <p className="error-msg">{saveError}</p>}
      <BookMetadata book={book} aiData ={data} aiIsLoading={loading ?? false} analysisError={analysisError || ""} />
      {showModal && (
        <Modal
          isOpen={showModal}
          title={book.title}
          content={content}
          isLoading={isLoading}
          error={error}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default BookDetails;
