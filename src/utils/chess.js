// Проверка хода для текущей доски
export const canMovePiece = (fromRow, fromCol, toRow, toCol, piece, board, moves) => {
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

// Проверка хода на тестовой доске (для симуляции шаха/мата)
export const canMoveOnBoard = (testBoard, fromRow, fromCol, toRow, toCol, piece) => {
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

// Проверка, находится ли король под атакой
export const isKingInCheck = (testBoard, kingColor) => {
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

// Проверка наличия легальных ходов (для определения мата/пата)
export const hasAnyLegalMoves = (testBoard, color) => {
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
