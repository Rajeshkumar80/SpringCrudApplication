import {
  MdDashboard, MdInventory2, MdBarChart, MdSmartphone,
} from 'react-icons/md';
import {
  RiRobot2Fill, RiDatabase2Fill, RiBrainFill,
  RiShoppingBag3Fill, RiSearchEyeLine,
} from 'react-icons/ri';

const navItems = [
  {
    section: 'Overview',
    items: [
      { id: 'dashboard',  label: 'Dashboard',  icon: <MdDashboard /> },
      { id: 'analytics',  label: 'Analytics',  icon: <MdBarChart /> },
    ],
  },
  {
    section: 'Inventory',
    items: [
      { id: 'products', label: 'Products', icon: <MdInventory2 /> },
    ],
  },
  {
    section: 'AI Features',
    items: [
      { id: 'ai-database',       label: 'AI Chat with DB',     icon: <RiDatabase2Fill /> },
      { id: 'ai-insights',       label: 'Business Analyst',    icon: <RiBrainFill /> },
      { id: 'ai-consultant',     label: 'Product Consultant',  icon: <RiShoppingBag3Fill /> },
      { id: 'ai-recommendations',label: 'Recommendation AI',   icon: <RiRobot2Fill /> },
      { id: 'ai-search',         label: 'AI Search',           icon: <RiSearchEyeLine /> },
      { id: 'ai-assistant',      label: 'AI Chatbot',          icon: <RiRobot2Fill /> },
    ],
  },
];

function Sidebar({ activePage, setActivePage, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <MdSmartphone />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">AI Product</span>
          <span className="sidebar-logo-sub">Intelligence Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        AI Powered · Spring Boot + React
      </div>
    </aside>
  );
}

export default Sidebar;
