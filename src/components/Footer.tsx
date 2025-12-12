export default function Footer() {
  return (
    <footer className="bg-slate-800/80 backdrop-blur-xl border-t border-purple-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-linear-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <span className="text-white font-semibold">SocialHub</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            {['About', 'Help', 'Terms', 'Privacy', 'Cookies', 'Ads'].map((item) => (
              <a key={item} href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
          
          <div className="text-slate-400 text-sm">
            © 2024 SocialHub. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}