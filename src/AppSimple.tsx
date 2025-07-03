function App() {
  console.log('App component is rendering...');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Word Master</h1>
          <p className="text-white/80 mb-6">Ultimate word guessing challenge!</p>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your name"
            />
            <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200">
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
