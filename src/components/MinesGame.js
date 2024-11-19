import React, { useState, useContext } from 'react';
import { Bomb } from 'lucide-react';
import { CreditContext } from '../contexts/CreditContext';

const MinesGame = () => {
    const { credits, setCredits } = useContext(CreditContext);
    const [bet, setBet] = useState(10);
    const [mines, setMines] = useState(3);
    const [isPlaying, setIsPlaying] = useState(false);
    const [board, setBoard] = useState(Array(25).fill(null));
    const [revealed, setRevealed] = useState(Array(25).fill(false));
    const [gameOver, setGameOver] = useState(false);
    const [currentMultiplier, setCurrentMultiplier] = useState(1);
    const [message, setMessage] = useState('');
    const [canCashOut, setCanCashOut] = useState(false);
    const [gameId, setGameId] = useState(null);
    const [hitMineIndex, setHitMineIndex] = useState(null);
    const [allMinesRevealed, setAllMinesRevealed] = useState(false);
    const [minePositions, setMinePositions] = useState(new Set());
  
    const resetGame = () => {
      setBoard(Array(25).fill(null));
      setRevealed(Array(25).fill(false));
      setGameOver(false);
      setCurrentMultiplier(1);
      setCanCashOut(false);
      setMessage('');
      setIsPlaying(false);
      setGameId(null);
      setHitMineIndex(null);
      setAllMinesRevealed(false);
      setMinePositions(new Set());
    };
  
    const startGame = async () => {
      const betAmount = Number(bet);
      if (isNaN(credits) || credits < betAmount) {
        setMessage('Nie masz wystarczającej ilości kredytów!');
        return;
      }
  
      setCredits(prevCredits => {
        const newCredits = Number(prevCredits) - betAmount;
        return isNaN(newCredits) ? 0 : newCredits;
      });
      
      resetGame();
      setIsPlaying(true);
      setCanCashOut(true);
  
      try {
        const response = await fetch('http://localhost:3002/mines/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bet: betAmount, mines }),
        });
        
        const data = await response.json();
        setBoard(Array(25).fill(null));
        setGameId(data.gameId);
        setMessage('Gra rozpoczęta! Wybierz pole.');
      } catch (error) {
        console.error('Error starting game:', error);
        setMessage('Wystąpił błąd podczas łączenia z serwerem');
        setIsPlaying(false);
      }
    };
  
    const cashOut = async () => {
      if (!canCashOut || !gameId) return;
  
      try {
        const response = await fetch('http://localhost:3002/mines/cashout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            gameId,
            bet: Number(bet)
          }),
        });
  
        const data = await response.json();
        
        if (data.success) {
          setCredits(prevCredits => {
            const newCredits = Number(prevCredits) + data.winAmount;
            return isNaN(newCredits) ? prevCredits : newCredits;
          });
          setMessage(`Wypłacono ${data.winAmount.toFixed(2)} kredytów!`);
          setCanCashOut(false);
          setIsPlaying(false);
          resetGame();
        } else {
          setMessage('Błąd podczas wypłaty!');
          if (data.forceReset) {
            resetGame();
          }
        }
      } catch (error) {
        console.error('Error cashing out:', error);
        setMessage('Wystąpił błąd podczas łączenia z serwerem');
        resetGame();
      }
    };
  
    const revealTile = async (index) => {
      if (!isPlaying || revealed[index] || gameOver || !gameId) return;
  
      try {
        const response = await fetch('http://localhost:3002/mines/reveal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Game-Id': gameId
          },
          body: JSON.stringify({ index, bet: Number(bet), mines }),
        });
        
        const data = await response.json();
        
        if (data.isMine) {
          const newBoard = [...board];
          data.fullBoard.forEach((tile, i) => {
            newBoard[i] = tile;
            if (tile === '💣') {
              setMinePositions(prev => new Set([...prev, i]));
            }
          });
          setBoard(newBoard);
          
          setHitMineIndex(index);
          setGameOver(true);
          setCanCashOut(false);
          setIsPlaying(false);
          setAllMinesRevealed(true);
          setMessage(`Boom! Przegrałeś ${bet} kredytów!`);
          return;
        }
        
        if (data.forceReset) {
          resetGame();
          return;
        }
  
        const newBoard = [...board];
        newBoard[index] = '💎';
        setBoard(newBoard);
        
        const newRevealed = [...revealed];
        newRevealed[index] = true;
        setRevealed(newRevealed);
  
        setCurrentMultiplier(data.multiplier);
        const potentialWin = (Number(bet) * data.multiplier).toFixed(2);
        setMessage(`Możliwa wygrana: ${potentialWin} kredytów (${data.multiplier}x)`);
      } catch (error) {
        console.error('Error revealing tile:', error);
        setMessage('Wystąpił błąd podczas łączenia z serwerem');
        resetGame();
      }
    };
  
    const renderTile = (index) => {
      const isMine = minePositions.has(index);
      const isRevealed = revealed[index] || (allMinesRevealed && isMine);
      const isHitMine = index === hitMineIndex;
      const tileContent = board[index];
      
      let tileStyle = `
        w-16 h-16 rounded-lg flex items-center justify-center text-2xl
        ${!isPlaying && !gameOver ? 'opacity-50' : ''}
        transition-all duration-200
      `;

      if (isRevealed) {
        if (isMine) {
          tileStyle += isHitMine 
            ? ' bg-red-600 animate-pulse transform scale-110' 
            : ' bg-red-500';
        } else {
          tileStyle += ' bg-blue-500';
        }
      } else {
        tileStyle += ' bg-slate-700 hover:bg-slate-600';
      }
      
      return (
        <button
          key={index}
          onClick={() => revealTile(index)}
          disabled={!isPlaying || isRevealed || gameOver}
          className={tileStyle}
        >
          {isRevealed && (
            isMine 
              ? <Bomb size={24} className={isHitMine ? 'text-white animate-spin' : 'text-white'} />
              : tileContent
          )}
        </button>
      );
    };
  
    const displayCredits = isNaN(credits) ? '0.00' : credits.toFixed(2);
  
    return (
      <div className="flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-6">Mines</h1>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl">Kredyty: {displayCredits}</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label>Zakład:</label>
                <select 
                  value={bet}
                  onChange={(e) => setBet(Number(e.target.value))}
                  disabled={isPlaying}
                  className="bg-slate-700 p-2 rounded"
                >
                  <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="200">2000</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Miny:</label>
                <select 
                  value={mines}
                  onChange={(e) => setMines(Number(e.target.value))}
                  disabled={isPlaying}
                  className="bg-slate-700 p-2 rounded"
                >
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>
            </div>
          </div>
  
          <div className="grid grid-cols-5 gap-2 mb-6">
            {Array(25).fill(null).map((_, index) => renderTile(index))}
          </div>
  
          <div className="flex gap-4">
            {!isPlaying && !gameOver ? (
              <button
                onClick={startGame}
                disabled={isNaN(credits) || credits < bet}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 p-3 rounded-lg font-bold"
              >
                GRAJ
              </button>
            ) : gameOver ? (
              <button
                onClick={startGame}
                disabled={isNaN(credits) || credits < bet}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 p-3 rounded-lg font-bold"
              >
                ZAGRAJ PONOWNIE
              </button>
            ) : (
              <>
                <button
                  onClick={cashOut}
                  disabled={!canCashOut}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 p-3 rounded-lg font-bold"
                >
                  WYPŁAĆ ({(Number(bet) * currentMultiplier).toFixed(2)})
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 bg-red-600 hover:bg-red-700 p-3 rounded-lg font-bold"
                >
                  ANULUJ
                </button>
              </>
            )}
          </div>
          
        {message && (
            <div className={`mt-4 text-center font-bold ${gameOver ? 'text-red-500 text-xl animate-bounce' : 
            message.includes('Możliwa wygrana:') ? 'text-green-500 text-xl animate-bounce' : ''}`}>
            {message}
            </div> )}
        </div>
      </div>
    );
};

export default MinesGame;