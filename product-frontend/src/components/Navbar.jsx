import { MdMenu, MdLightMode, MdDarkMode, MdAdd } from 'react-icons/md';

const pageTitles = {
  dashboard: { title: 'Dashboard', sub: 'Overview of your product inventory' },
  analytics:  { title: 'Analytics',  sub: 'Charts and insights' },
  products:   { title: 'Products',   sub: 'Manage your product catalog' },
  'ai-assistant': { title: 'AI Assistant', sub: 'Ask anything about your inventory' },
};

function Navbar({ activePage, darkMode, toggleDark, onAddProduct, toggleSidebar }) {
  const page = pageTitles[activePage] || { title: 'Dashboard', sub: '' };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="dark-toggle" onClick={toggleSidebar} title="Toggle menu">
          <MdMenu />
        </button>
        <div>
          <div className="navbar-title">{page.title}</div>
          <div className="navbar-subtitle">{page.sub}</div>
        </div>
      </div>

      <div className="navbar-right">
        {activePage === 'products' && (
          <button className="btn btn-primary" onClick={onAddProduct}>
            <MdAdd size={16} />
            Add Product
          </button>
        )}
        <button className="dark-toggle" onClick={toggleDark} title="Toggle theme">
          {darkMode ? <MdLightMode /> : <MdDarkMode />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
