import { MdMenu, MdLightMode, MdDarkMode, MdAdd } from 'react-icons/md';

const pageTitles = {
  dashboard:            { title: 'Dashboard',                 sub: 'Real-time overview of your product inventory' },
  analytics:            { title: 'Analytics',                 sub: 'Charts and data insights' },
  products:             { title: 'Products',                  sub: 'Manage your complete product catalog' },
  'ai-database':        { title: 'AI Chat with Database',     sub: 'Ask anything in plain English — AI queries your database' },
  'ai-insights':        { title: 'AI Business Analyst',       sub: 'AI-generated insights from your live inventory data' },
  'ai-consultant':      { title: 'AI Product Consultant',     sub: 'Get expert recommendations tailored to your exact needs' },
  'ai-recommendations': { title: 'AI Recommendation Engine',  sub: 'Every product intelligently scored across 6 dimensions' },
  'ai-search':          { title: 'AI Natural Language Search', sub: 'Describe what you want — no filters, no dropdowns' },
  'ai-assistant':       { title: 'AI Chatbot',                sub: 'Conversational assistant powered by your inventory' },
};

export default function Navbar({ activePage, darkMode, toggleDark, onAddProduct, toggleSidebar }) {
  const page = pageTitles[activePage] || { title: 'Dashboard', sub: '' };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="dark-toggle" onClick={toggleSidebar} title="Toggle sidebar"
          style={{ border: 'none' }}>
          <MdMenu size={20} />
        </button>
        <div>
          <div className="navbar-title">{page.title}</div>
          <div className="navbar-subtitle">{page.sub}</div>
        </div>
      </div>

      <div className="navbar-right">
        {activePage === 'products' && (
          <button className="btn btn-primary" onClick={onAddProduct}
            style={{ gap: 6, fontSize: 12.5, padding: '7px 14px' }}>
            <MdAdd size={16} />
            Add Product
          </button>
        )}
        <button className="dark-toggle" onClick={toggleDark}
          title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <MdLightMode size={17} /> : <MdDarkMode size={17} />}
        </button>
      </div>
    </header>
  );
}
