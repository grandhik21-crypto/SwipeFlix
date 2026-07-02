function Navigation({ currentPage, setCurrentPage, user }) {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-500">🎬 SwipeFlix</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setCurrentPage('swipe')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentPage === 'swipe'
                ? 'bg-red-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentPage === 'profile'
                ? 'bg-red-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Profile
          </button>
          {user && <span className="text-gray-400 text-sm">{user.username}</span>}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
