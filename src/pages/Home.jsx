import React from 'react';

export function Home({ onStartGame }) {
  return (
    <div className="app-container">
      <h1 className="app-title">Шахматы</h1>
      
      <div style={{
        textAlign: 'center',
        color: '#fff',
        maxWidth: '600px',
        marginTop: '40px'
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', lineHeight: '1.6' }}>
          Добро пожаловать в онлайн-шахматы! 
          Играйте на одном устройстве, доска автоматически разворачивается после каждого хода.
        </p>
        
        <div style={{ marginBottom: '40px', fontSize: '0.95rem', color: '#e0e0e0' }}>
          <p><strong>Особенности:</strong></p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✓ Полная поддержка правил шахмат</li>
            <li>✓ Проверка шаха и мата</li>
            <li>✓ История ходов с пагинацией</li>
            <li>✓ Отмена последнего хода</li>
            <li>✓ Доска разворачивается для каждого игрока</li>
          </ul>
        </div>

        <button
          onClick={onStartGame}
          style={{
            padding: '16px 40px',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#000',
            background: '#ffd700',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background 150ms ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.background = '#ffcc00'}
          onMouseLeave={(e) => e.target.style.background = '#ffd700'}
        >
          Начать игру →
        </button>
      </div>
    </div>
  );
}
