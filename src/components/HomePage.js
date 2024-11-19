import React, { useState, useContext } from 'react';
import { Home, Menu, X, ChevronRight, Wallet } from 'lucide-react';
import { CreditContext } from '../contexts/CreditContext';
import SlotMachine from './SlotMachine';
import MinesGame from './MinesGame';

const HomePage = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { credits } = useContext(CreditContext);

  const games = [
    {
      id: 'slots',
      name: 'Jednoręki Bandyta',
      description: 'Klasyczna gra w jednorękiego bandytę z szansą na duże wygrane!',
      component: SlotMachine,
      imageUrl: 'https://i.imgur.com/kUR9WPa.png',
    },
    {
      id: 'mines',
      name: 'Mines',
      description: 'Odkrywaj diamenty i unikaj min! Im więcej odkryjesz, tym większa wygrana!',
      component: MinesGame,
      imageUrl: 'https://i.imgur.com/0NNWfcl.png',
    }
  ];

  const renderGameCard = (game) => (
    <div 
      key={game.id}
      className="group relative bg-slate-800/50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer backdrop-blur-sm hover:scale-105 hover:-translate-y-1"
      onClick={() => setSelectedGame(game)}
    >
      {/* Glowing backdrop effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <img 
        src={game.imageUrl} 
        alt={game.name}
        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="relative p-6">
        <h3 className="text-2xl font-bold mb-3 group-hover:text-green-400 transition-colors duration-300">
          {game.name}
        </h3>
        <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
          {game.description}
        </p>
        <button 
          className="mt-6 w-full bg-gradient-to-r from-green-700 to-green-500 hover:from-green-500 hover:to-green-400 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
        >
          Graj Teraz
          <ChevronRight className="group-hover:translate-x-1 transition-transform duration-300" size={20} />
        </button>
      </div>
    </div>
  );

  const Sidebar = () => (
    <>
      {/* Backdrop blur when sidebar is open */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-40`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-800/95 backdrop-blur-md transform transition-all duration-300 ease-out ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} z-50`}>
        <div className="p-4">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700/50 transition-colors duration-300"
          >
            <X size={24} />
          </button>
          
          <div className="mt-8 space-y-4">
            <button 
              onClick={() => {
                setSelectedGame(null);
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-300 hover:translate-x-2"
            >
              <Home size={20} />
              Strona Główna
            </button>
            
            <div className="border-t border-slate-700/50 pt-4">
              <h3 className="text-sm text-slate-400 mb-3 px-3">Gry</h3>
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGame(game);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-300 hover:translate-x-2"
                >
                  {game.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const Header = () => (
    <header className="bg-slate-800/50 backdrop-blur-md supports-[backdrop-filter]:bg-slate-800/50 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors duration-300"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Kasynko24.pl
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-700/30 py-2 px-4 rounded-full">
            <Wallet size={20} className="text-yellow-500" />
            <span className="font-bold text-yellow-500">{credits?.toFixed(2)} PLN</span>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedGame ? (
          <div className="animate-fadeIn">
            <button 
              onClick={() => setSelectedGame(null)}
              className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
            >
              ← Powrót do lobby
            </button>
            <selectedGame.component />
          </div>
        ) : (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Popularne Gry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map(renderGameCard)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;