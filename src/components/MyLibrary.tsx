import React, { useState, useEffect } from "react";
import useFetchData from "../hooks/useFetchData";
import useDeleteBook from "../hooks/useDeleteBook";
import BookSearch from "./BookSearch";
import BookDetails from "./BookDetails";
import BooksList, { Book } from "./BooksList";
import Modal from "./Modal";

function MyLibrary() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [deleteBookId, setDeleteBookId] = useState<number | null>(null); // Track the book to be deleted
  const [isModalOpen, setModalOpen] = useState(false); // Manage modal state
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  ); // Modal dynamic content
  const [modalTitle, setModalTitle] = useState<string>(""); // Modal title

  const {
    data: fetchedBooks,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchData<Book[]>("/books");
  const deleteBook = useDeleteBook();

  // Update local state with fetched books when data is loaded
  useEffect(() => {
    if (fetchedBooks) {
      setBooks(fetchedBooks);
    }
  }, [fetchedBooks]);

  // Handle book selection from search or list
  const handleBookClicked = (book: Book) => {
    setSelectedBook(book);
  };

  // Handle book saving in BookDetails
  const handleBookSaved = (newBook: Book) => {
    setBooks((prevBooks) => [...prevBooks, { ...newBook, local: true }]);
    setModalTitle("Success");
    setModalContent(
      <p>The book has been successfully added to your library.</p>
    );
    setModalOpen(true);
  };

  // Handle delete button click to open modal
  const handleDeleteClick = (bookId: number) => {
    setDeleteBookId(bookId);
    setModalTitle("Confirm Deletion");
    setModalContent(
      <p>
        Are you sure you want to delete this book? This action cannot be undone.
      </p>
    );
    setModalOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteBookId === null) return;

    deleteBook.mutate(deleteBookId, {
      onSuccess: () => {
        setBooks((prevBooks) =>
          prevBooks.filter((book) => book.id !== deleteBookId)
        );
        setModalTitle("Success");
        setModalContent(<p>The book has been successfully deleted.</p>);
        setDeleteBookId(null);
      },
    });
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setDeleteBookId(null); // Reset deletion state
    setSelectedBook(null); // Reset selected book
  };

  return (
    <>
      <BookSearch existingBooks={books} onBookSelect={handleBookClicked} />
      {!!selectedBook && 
        <BookDetails
          book={selectedBook}
          onBookSaved={handleBookSaved}
          onClose={() => setSelectedBook(null)}
          onBookProcessed={async () => {
            await refetch();
            if (selectedBook) {
              const newSelectedBook = fetchedBooks?.find(
                (b) => selectedBook.id === b.id
              );
              if (newSelectedBook) {
                setSelectedBook(newSelectedBook);
              }
            }
          }}
        />
      }
      <BooksList
        books={books}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onBookClick={handleBookClicked}
        onDeleteClick={handleDeleteClick} // Pass delete handler to BooksList
      />
      {/* Modal */}
      <Modal
        title={modalTitle}
        content={modalContent}
        onClose={closeModal}
        onConfirm={deleteBookId ? confirmDelete : undefined}
        isOpen={isModalOpen}
        showConfirmButton={!!deleteBookId} // Show confirm button only for delete confirmation
      />
    </>
  );
}

export default MyLibrary;
