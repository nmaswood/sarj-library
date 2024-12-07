import React from 'react';

export interface Author {
  name: string;
}

export interface Book {
  bookshelves: any;
  id: number;
  title: string;
  authors: Author[];
  translators?: Author[];
  subjects?: string[];
  languages?: string[];
  local?: boolean; 
  aiData?: any;
}

interface BooksListProps {
  onBookClick: (book: Book) => void;
  onDeleteClick: (bookId: number) => void;
  books: Book[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message?: string } | null;
}

const BooksList: React.FC<BooksListProps> = ({ onBookClick, onDeleteClick, books, isLoading, isError, error }) => {
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error?.message}</p>;

  return (
    <>
      <h1>Books List</h1>
      <ul className="items-list">
        <li className="items-row header-row">
          <div className="item-cell">Title</div>
          <div className="item-cell">Author</div>
          <div className="item-cell">Actions</div>
        </li>
        {books?.map((book) => (
          <li key={book.id} className="items-row">
            <div className="item-cell">{book.title}</div>
            <div className="item-cell">{book.authors?.map((author) => author.name).join(', ')}</div>
            <div className="item-cell action-btns-cell">
              <button className='success-msg' onClick={() => onBookClick(book)}>Show book details</button>
              <button className='error-msg' onClick={() => onDeleteClick(book.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default BooksList;
