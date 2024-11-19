import React, { useState, useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { CreditContext } from '../contexts/CreditContext';

const SlotMachine = () => {
    const symbols = ['🍎', '🍋', '🍒', '💎', '7️⃣', '🎰'];
    const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
    const [isSpinning, setIsSpinning] = useState(false);
    const [bet, setBet] = useState(10);
    const [message, setMessage] = useState('');
    const { credits, setCredits } = useContext(CreditContext);
    
    const spin = async () => {
      if (credits < bet) {
        setMessage('Nie masz wystarczającej ilości kredytów!');
        return;
      }
      
      setIsSpinning(true);
      setMessage('');
      setCredits(prev => prev - bet);
      
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setReels(reels.map(() => symbols[Math.floor(Math.random() * symbols.length)]));
      }
      
      try {
        const response = await fetch('http://localhost:3002/spin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bet }),
        });
        
        const data = await response.json();
        setReels(data.result);
        setCredits(prev => prev + data.winAmount);
        setMessage(data.winAmount > 0 ? `Wygrałeś ${data.winAmount} kredytów!` : 'Spróbuj ponownie!');
      } catch (error) {
        setMessage('Wystąpił błąd podczas łączenia z serwerem');
      }
      
      setIsSpinning(false);
    };
  
    return (
      <div className="flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-6">Jednoręki Bandyta</h1>
          
          <div className="flex gap-4 text-6xl bg-slate-700 p-4 rounded-lg mb-6">
            {reels.map((symbol, index) => (
              <div key={index} className="w-24 h-24 flex items-center justify-center bg-slate-600 rounded">
                {symbol}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl">Kredyty: {credits}</div>
            <div className="flex items-center gap-2">
              <label>Zakład:</label>
              <select 
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                className="bg-slate-700 p-2 rounded"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={spin}
            disabled={isSpinning || credits < bet}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 p-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            {isSpinning ? (
              <>
                <Loader2 className="animate-spin" />
                Kręcenie...
              </>
            ) : (
              'ZAKRĘĆ!'
            )}
          </button>
          
          {message && (
            <div className="mt-4 text-center font-bold">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  };

  export default SlotMachine;