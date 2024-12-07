import React, { useState, useEffect, useRef } from 'react';
import useBookSearch from '../hooks/useBookSearch';

interface BookSearchProps {
  onBookSelect: (book: any) => void;
  existingBooks: { id: number; local?: boolean }[]; // Pass existing books to mark them
}

const BookSearch: React.FC<BookSearchProps> = ({ onBookSelect, existingBooks }) => {
  const { query, setQuery, results, loading, error } = useBookSearch();
  const [isDropdownVisible, setDropdownVisible] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null); // Reference to the search component

  // Filter results to show only books of type "text"
  const filteredResults = results.filter(
    (book:any) => book.media_type.toLowerCase() === 'text'
  );

  // Check if a book is already in the system
  const isBookInSystem = (bookId: number) =>
    existingBooks.some((existingBook) => existingBook.id === bookId && existingBook.local);

  const handleSelect = (book: any, label: string) => {
    let updatedBook = {...book};
    if (isBookInSystem(book.id)) {
      updatedBook = { ...updatedBook, local: true };
    }

    // Add `local: true` to the book object and pass it to the parent
    setQuery(label);
    setDropdownVisible(false);
    onBookSelect(updatedBook);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
      setQuery(''); // Clear the search box
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="book-search" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setDropdownVisible(true);
        }}
        className="search-box"
        placeholder="Search for a book..."
      />

      {error && <div className="error-msg">{error}</div>}

      {loading && <div className="drop-down">Loading...</div>}

      {filteredResults.length > 0 && !loading && isDropdownVisible && (
        <ul className="drop-down results-drop-down">
          {filteredResults.map((book) => {
            const label = `${book.title} by ${book.authors
              .map((author) => author.name)
              .join(', ')}`;
            const inSystem = isBookInSystem(book.id); // Check if the book is already in the system

            return (
              <li
                key={book.id}
                onClick={() => handleSelect(book, label)}
                className={`drop-down-item ${inSystem ? 'book-in-system' : ''}`}
              >
                <span className="font-semibold">{book.title}</span>
                {' by '}
                <span className="text-gray-600">
                  {book.authors.map((author) => author.name).join(', ')}
                </span>
                {inSystem && (
                  <span className="success-msg">(Already in system)</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BookSearch;
