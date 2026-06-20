import React from 'react';
import { UNICODE_PIECES } from '../utils/constants';

export function Board({ 
  visibleBoard, 
  selectedSquare, 
  boardCoordinates, 
  handleSquareClick 
}) {
  return (
    <div className="board">
      {visibleBoard.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const actualCoords = boardCoordinates(rowIndex, colIndex);
          const isDark = (rowIndex + colIndex) % 2 === 1;
          const isSelected = selectedSquare?.row === actualCoords.row && selectedSquare?.col === actualCoords.col;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              className={`square ${isDark ? 'black' : 'white'} ${isSelected ? 'selected' : ''}`}
            >
              {piece && (
                <span className={`piece ${piece.color}`}>
                  {UNICODE_PIECES[piece.color][piece.type]}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
