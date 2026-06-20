import React from 'react';

export function History({
  paginatedMoves,
  currentPage,
  totalPages,
  movesPerPage,
  onPrevPage,
  onNextPage,
  onUndo,
  onReset,
  moves
}) {
  return (
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
            onClick={onPrevPage}
            disabled={currentPage === 0}
            className={`button ${currentPage === 0 ? 'disabled' : ''}`}
          >
            ← Назад
          </button>
          <span className="page-label">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={currentPage === totalPages - 1}
            className={`button ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
          >
            Вперёд →
          </button>
        </div>
      )}

      <div className="button-row">
        <button
          onClick={onUndo}
          disabled={moves.length === 0}
          className={`button ${moves.length === 0 ? 'disabled' : ''}`}
        >
          ← Отменить
        </button>
        <button
          onClick={onReset}
          className="button primary"
        >
          Новая игра
        </button>
      </div>
    </div>
  );
}
