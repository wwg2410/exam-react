import React, { useState } from 'react';
 import './App.css';

const UNICODE_PIECES = {
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' }
};

// Начальная расстановка фигур на шахматной доске
const createInitialBoard = () => {
  return [
    // 8 ряд (чёрные фигуры)
    [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' }
    ],
    // 7 ряд (чёрные пешки)
    [
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' }
    ],
    // Пустые поля (6, 5, 4, 3 ряды)
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    // 2 ряд (белые пешки)
    [
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' }
    ],
    // 1 ряд (белые фигуры)
    [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' }
    ]
  ];
};

export default function ChessGame() {
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moves, setMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'check' | 'checkmate' | 'stalemate'
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

  // Валидация хода для текущей игры
  const canMovePiece = (fromRow, fromCol, toRow, toCol, piece) => {
    if (!piece) return false;
    if (fromRow === toRow && fromCol === toCol) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const rowDiffAbs = Math.abs(rowDiff);
    const colDiffAbs = Math.abs(colDiff);
    const targetPiece = board[toRow][toCol];

    if (targetPiece?.color === piece.color) return false;

    const isPathClear = (fr, fc, tr, tc) => {
      const dr = tr === fr ? 0 : tr > fr ? 1 : -1;
      const dc = tc === fc ? 0 : tc > fc ? 1 : -1;
      let r = fr + dr;
      let c = fc + dc;
      while (r !== tr || c !== tc) {
        if (board[r][c]) return false;
        r += dr;
        c += dc;
      }
      return true;
    };

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (colDiffAbs === 0 && rowDiff === direction && !targetPiece) return true;
        if (colDiffAbs === 0 && rowDiff === 2 * direction && fromRow === startRow && !targetPiece && !board[fromRow + direction][fromCol]) return true;
        if (colDiffAbs === 1 && rowDiff === direction && targetPiece) return true;
        
        if (colDiffAbs === 1 && rowDiff === direction) {
          const lastMove = moves[moves.length - 1];
          if (lastMove && lastMove.piece.type === 'pawn' && 
              Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
              lastMove.to.row === fromRow &&
              lastMove.to.col === toCol) {
            return true;
          }
        }
        return false;
      }
      case 'rook':
        return (fromRow === toRow || fromCol === toCol) && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'knight':
        return (rowDiffAbs === 2 && colDiffAbs === 1) || (rowDiffAbs === 1 && colDiffAbs === 2);
      case 'bishop':
        return rowDiffAbs === colDiffAbs && rowDiffAbs > 0 && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'queen':
        return (fromRow === toRow || fromCol === toCol || rowDiffAbs === colDiffAbs) && rowDiffAbs + colDiffAbs > 0 && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'king':
        return rowDiffAbs <= 1 && colDiffAbs <= 1;
      default:
        return false;
    }
  };

  // Проверка хода на тестовой виртуальной доске (для симуляции шаха/мата)
  const canMoveOnBoard = (testBoard, fromRow, fromCol, toRow, toCol, piece) => {
    if (!piece) return false;
    if (fromRow === toRow && fromCol === toCol) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const rowDiffAbs = Math.abs(rowDiff);
    const colDiffAbs = Math.abs(colDiff);
    const targetPiece = testBoard[toRow][toCol];

    if (targetPiece?.color === piece.color) return false;

    const isPathClear = (fr, fc, tr, tc) => {
      const dr = tr === fr ? 0 : tr > fr ? 1 : -1;
      const dc = tc === fc ? 0 : tc > fc ? 1 : -1;
      let r = fr + dr;
      let c = fc + dc;
      while (r !== tr || c !== tc) {
        if (testBoard[r][c]) return false;
        r += dr;
        c += dc;
      }
      return true;
    };

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        if (colDiffAbs === 0 && rowDiff === direction && !targetPiece) return true;
        if (colDiffAbs === 0 && rowDiff === 2 * direction && fromRow === startRow && !targetPiece && !testBoard[fromRow + direction][fromCol]) return true;
        if (colDiffAbs === 1 && rowDiff === direction && targetPiece) return true;
        return false;
      }
      case 'rook':
        return (fromRow === toRow || fromCol === toCol) && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'knight':
        return (rowDiffAbs === 2 && colDiffAbs === 1) || (rowDiffAbs === 1 && colDiffAbs === 2);
      case 'bishop':
        return rowDiffAbs === colDiffAbs && rowDiffAbs > 0 && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'queen':
        return (fromRow === toRow || fromCol === toCol || rowDiffAbs === colDiffAbs) && rowDiffAbs + colDiffAbs > 0 && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'king':
        return rowDiffAbs <= 1 && colDiffAbs <= 1;
      default:
        return false;
    }
  };

  const isKingInCheck = (testBoard, kingColor) => {
    let kingPos = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = testBoard[r][c];
        if (p && p.type === 'king' && p.color === kingColor) {
          kingPos = { r, c };
          break;
        }
      }
      if (kingPos) break;
    }
    if (!kingPos) return false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = testBoard[r][c];
        if (p && p.color !== kingColor) {
          if (canMoveOnBoard(testBoard, r, c, kingPos.r, kingPos.c, p)) return true;
        }
      }
    }
    return false;
  };

  const hasAnyLegalMoves = (testBoard, color) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = testBoard[r][c];
        if (!p || p.color !== color) continue;
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            if (!canMoveOnBoard(testBoard, r, c, tr, tc, p)) continue;
            const nb = testBoard.map(row => [...row]);
            nb[tr][tc] = p;
            nb[r][c] = null;
            if (!isKingInCheck(nb, color)) return true;
          }
        }
      }
    }
    return false;
  };

  const handleSquareClick = (rowIndex, colIndex) => {
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;
    const { row, col } = boardCoordinates(rowIndex, colIndex);
    const clickedPiece = board[row][col];

    if (selectedSquare) {
      const fromPiece = board[selectedSquare.row][selectedSquare.col];

      if (fromPiece && fromPiece.color === currentPlayer && canMovePiece(selectedSquare.row, selectedSquare.col, row, col, fromPiece)) {
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

  // исправление бага с пагинацией при отмене хода: если после отмены хода текущая страница выходит за пределы, то возвращаемся на последнюю страницу
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

      {/* Оповещения статуса игры */}
      <div className="hint">
        {gameStatus === 'check' && (
          <div className="hint-check">Шах!</div>
        )}
        {gameStatus === 'checkmate' && (
          <div className="text-red-400 font-bold">
            Мат! Победили {winner === 'white' ? 'Белые' : 'Чёрные'}
          </div>
        )}
        {gameStatus === 'stalemate' && (
          <div className="text-gray-400 font-bold">
            Пат — ничья
          </div>
        )}
      </div>

      {/* Главная рабочая область */}
      <div className="main-area">
        
        {/* Контейнер доски */}
        <div className="board-panel">
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

          <p className="board-turn">
            Ход: <strong>{currentPlayer === 'white' ? 'Белые' : 'Чёрные'}</strong>
          </p>
        </div>

        {/* Правая панель: История и управление */}
        <div className="right-panel">
          <h2 className="history-title">История ходов</h2>
          
          <div className="history-box">
            {paginatedMoves.length > 0 ? (
              <ul className="history-list">
                {paginatedMoves.map((move, idx) => (
                  <li 
                    key={idx} 
                    className={`history-item ${move.piece.color}`}
                  >
                    <strong>{currentPage * movesPerPage + idx + 1}.</strong> {move.notation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="history-empty">
                Ходы отсутствуют
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pager">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`button ${currentPage === 0 ? 'disabled' : ''}`}
              >
                ← Назад
              </button>
              <span className="page-label">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className={`button ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
              >
                Вперёд →
              </button>
            </div>
          )}

          <div className="button-row">
            <button
              onClick={undoLastMove}
              disabled={moves.length === 0}
              className={`button ${moves.length === 0 ? 'disabled' : ''}`}
            >
              ← Отменить
            </button>
            <button
              onClick={resetGame}
              className="button primary"
            >
              Новая игра
            </button>
          </div>

        </div>
      </div>

      <p className="hint">
        Нажимайте на фигуры для выбора, затем на клетку для хода
      </p>
    </div>
  );
}