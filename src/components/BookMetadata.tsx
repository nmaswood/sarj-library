import React, { useContext } from "react";
import { LanguageContext } from '../contexts/LanguageContext';
import { Book } from "./BooksList";

interface BookMetadataProps {
  book: Book;
  aiData?:any;
  aiIsLoading?: boolean;
  analysisError?: string;
}

const BookMetadata: React.FC<BookMetadataProps> = ({ book, aiData, aiIsLoading = false, analysisError = "" }) => {
  const { languages, isLoading, isError } = useContext(LanguageContext);
  const aiDataToView = aiData ? aiData : book.aiData;
  const getLanguageNames = (languageCodes: string[]) => {
    
    return (!isError && !isLoading && !!languages?.length) ? languageCodes
      .map((code) => languages?.find((lang) => lang.code === code)?.language)
      .filter(Boolean) // Remove undefined if a code doesn't match
      .join(', ') : languageCodes.join(', ');
  };
  const formatCharacters = (chars: any[])=>{
    return (
      <ul className="items-list">
          <li className="items-row header-row">
          <div className="item-cell">Name</div>
          <div className="item-cell">Importance</div>
          <div className="item-cell">Alignment</div>
        </li>
      {chars.map(char=>(<li key={char.id} className="items-row"><div className="item-cell">{char.name}</div><div className="item-cell">{char.classification}</div><div className="item-cell">{char.alignment}</div></li>))}
      </ul>)
  }
  return (
    <div className="book-metadata">
      <h2 className="book-title">{book.title}</h2>
      <p className="book-meta">
        <strong>Authors:</strong> {book.authors.map((author) => author.name).join(" - ")}
      </p>
      {!!book?.translators?.length && (<p className="book-meta">
        <strong>Authors:</strong> {book.translators.map((translator) => translator.name).join(" - ")}
      </p>)}

      <p className="book-meta">
        <strong>Subjects:</strong> {book.subjects?.join(", ")}
      </p>
      <p className="book-meta">
          <strong>Book shelves:</strong> {book?.bookshelves?.join(", ")}
      </p>
      <p className="book-meta">
        <strong>Languages:</strong> {getLanguageNames(book.languages || [])}
      </p>
      <div>
      {aiIsLoading && <p>Loading book analysis...</p>}
      {(!aiIsLoading && !analysisError && !aiDataToView && book.local ) && <p>Book Text is being proccessed...</p>}
      {analysisError && <p className="error-msg">{analysisError}</p>}
      {aiDataToView && (
        <div>
          <ul className="items-list">
              <li className="items-row header-row">
              <div className="item-cell"><h3>Book LLM Analysis</h3></div>
            </li>
         
            <li className="items-row header-row">
              <div className="item-cell">Item</div>
              <div className="item-cell">Data</div>
            </li>
          <li className="items-row"><div className="item-cell">Plot Summary:</div><div className="item-cell"> {aiDataToView?.plot_summary?.summary}</div></li>
          <li className="items-row"><div className="item-cell">Plot Summary (in Arabic):</div><div className="item-cell"> {aiDataToView?.plot_summary?.arabic}</div></li>
          <li className="items-row"><div className="item-cell">Main Characters:</div><div className="item-cell">{formatCharacters(aiDataToView.main_chars)}</div></li>
          <li className="items-row"><div className="item-cell">Sentiment Analysis:</div><div className="item-cell"> {aiDataToView.sentiment_analysis}</div></li>

        </ul>
        </div>
      )}
      
    </div>
    </div>
  );
};

export default BookMetadata;
