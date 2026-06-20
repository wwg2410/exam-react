import React, { useState } from 'react';
import { Board } from '../components/Board';
import { History } from '../components/History';
import { createInitialBoard } from '../utils/constants';
import { canMovePiece, isKingInCheck, hasAnyLegalMoves } from '../utils/chess';

export function Game() {
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moves, setMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const movesPerPage = 5;

  const boardCoordinates = (rowIndex, colIndex) => isFlipped
    ? { row: 7 - rowIndex, col: 7 - colIndex }
    : { row: rowIndex, col: colIndex };

  const visibleBoard = isFlipped
    ? board.slice().reverse().map(row => [...row].reverse())
    : board;

  const handleSquareClick = (rowIndex, colIndex) => {
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;
    const { row, col } = boardCoordinates(rowIndex, colIndex);
    const clickedPiece = board[row][col];

    if (selectedSquare) {
      const fromPiece = board[selectedSquare.row][selectedSquare.col];

      if (fromPiece && fromPiece.color === currentPlayer && canMovePiece(selectedSquare.row, selectedSquare.col, row, col, fromPiece, board, moves)) {
        const newBoard = board.map(row => [...row]);
        const capturedPiece = newBoard[row][col];
        newBoard[row][col] = fromPiece;
        newBoard[selectedSquare.row][selectedSquare.col] = null;

        if (isKingInCheck(newBoard, currentPlayer)) {
          setSelectedSquare(null);
          return;
        }

        const moveNotation = `${String.fromCharCode(65 + selectedSquare.col)}${8 - selectedSquare.row} → ${String.fromCharCode(65 + col)}${8 - row}${capturedPiece ? ' x' : ''}`;
        const newMove = {
          from: selectedSquare,
          to: { row, col },
          piece: fromPiece,
          notation: moveNotation,
          captured: capturedPiece
        };

        setBoard(newBoard);
        setMoves(prev => [...prev, newMove]);

        const opponent = currentPlayer === 'white' ? 'black' : 'white';
        const opponentInCheck = isKingInCheck(newBoard, opponent);
        const opponentHasMoves = hasAnyLegalMoves(newBoard, opponent);

        if (opponentInCheck && !opponentHasMoves) {
          setGameStatus('checkmate');
          setWinner(currentPlayer);
        } else if (!opponentInCheck && !opponentHasMoves) {
          setGameStatus('stalemate');
          setWinner(null);
        } else if (opponentInCheck) {
          setGameStatus('check');
          setWinner(null);
        } else {
          setGameStatus('playing');
          setWinner(null);
        }

        setCurrentPlayer(opponent);
        setIsFlipped(prev => !prev);
        setSelectedSquare(null);
      } else if (clickedPiece?.color === currentPlayer) {
        setSelectedSquare({ row, col });
      } else {
        setSelectedSquare(null);
      }
    } else {
      if (clickedPiece?.color === currentPlayer) {
        setSelectedSquare({ row, col });
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(moves.length / movesPerPage));
  const paginatedMoves = moves.slice(currentPage * movesPerPage, (currentPage + 1) * movesPerPage);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setMoves([]);
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setCurrentPage(0);
    setGameStatus('playing');
    setWinner(null);
    setIsFlipped(false);
  };

  const undoLastMove = () => {
    if (moves.length === 0) return;

    const newMoves = moves.slice(0, -1);
    const lastMove = moves[moves.length - 1];

    const newBoard = board.map(row => [...row]);
    newBoard[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    newBoard[lastMove.to.row][lastMove.to.col] = null;

    setBoard(newBoard);
    setMoves(newMoves);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    setIsFlipped(prev => !prev);
    setCurrentPage(Math.max(0, Math.ceil(newMoves.length / movesPerPage) - 1));
    
    const opponent = currentPlayer === 'white' ? 'black' : 'white';
    const opponentInCheck = isKingInCheck(newBoard, opponent);
    const opponentHasMoves = hasAnyLegalMoves(newBoard, opponent);
    if (opponentInCheck && !opponentHasMoves) {
      setGameStatus('checkmate');
      setWinner(currentPlayer === 'white' ? 'black' : 'white');
    } else if (!opponentInCheck && !opponentHasMoves) {
      setGameStatus('stalemate');
      setWinner(null);
    } else if (opponentInCheck) {
      setGameStatus('check');
      setWinner(null);
    } else {
      setGameStatus('playing');
      setWinner(null);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Шахматы</h1>

      <div className="hint">
        {gameStatus === 'check' && (
          <div className="hint-check">Шах!</div>
        )}
        {gameStatus === 'checkmate' && (
          <div>Мат! Победили {winner === 'white' ? 'Белые' : 'Чёрные'}</div>
        )}
        {gameStatus === 'stalemate' && (
          <div>Пат — ничья</div>
        )}
      </div>

      <div className="main-area">
        <div className="board-panel">
          <Board 
            visibleBoard={visibleBoard}
            selectedSquare={selectedSquare}
            boardCoordinates={boardCoordinates}
            handleSquareClick={handleSquareClick}
          />
          <p className="board-turn">
            Ход: <strong>{currentPlayer === 'white' ? 'Белые' : 'Чёрные'}</strong>
          </p>
        </div>

        <History
          paginatedMoves={paginatedMoves}
          currentPage={currentPage}
          totalPages={totalPages}
          movesPerPage={movesPerPage}
          onPrevPage={() => setCurrentPage(Math.max(0, currentPage - 1))}
          onNextPage={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          onUndo={undoLastMove}
          onReset={resetGame}
          moves={moves}
        />
      </div>

      <p className="hint">
        Нажимайте на фигуры для выбора, затем на клетку для хода
      </p>
    </div>
  );
}
