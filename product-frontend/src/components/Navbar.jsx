import { MdMenu, MdLightMode, MdDarkMode, MdAdd } from 'react-icons/md';

const pageTitles = {
  dashboard:            { title: 'Dashboard',            sub: 'Overview of your product inventory' },
  analytics:            { title: 'Analytics',            sub: 'Charts and data insights' },
  products:             { title: 'Products',             sub: 'Manage your product catalog' },
  'ai-database':        { title: 'AI Chat with Database',sub: 'Ask questions — AI converts them to SQL and queries your database' },
  'ai-insights':        { title: 'AI Business Analyst',  sub: 'AI-generated insights from your inventory data' },
  'ai-consultant':      { title: 'AI Product Consultant',sub: 'Get expert phone recommendations tailored to your needs' },
  'ai-recommendations': { title: 'AI Recommendation Engine', sub: 'Every product scored across Gaming, Camera, Battery, Performance, Value' },
  'ai-search':          { title: 'AI Natural Language Search', sub: 'Search in plain English — no filters needed' },
  'ai-assistant':       { title: 'AI Chatbot',           sub: 'Ask anything about your product inventory' },
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
