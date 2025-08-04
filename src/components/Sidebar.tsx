import React from 'react';
import { Nav } from 'react-bootstrap';
import { 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings,
  Clock,
  Download
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Subscription', icon: Plus },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'trials', label: 'Free Trials', icon: Clock },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (viewId: string) => {
    onViewChange(viewId);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1040 }} onClick={onClose} />}
      
      <div className={`sidebar ${isOpen ? 'show' : ''} d-flex flex-column p-3`}>
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.id}
              className={`sidebar-item d-flex align-items-center ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <item.icon size={18} className="me-2" />
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </>
  );
};

export default Sidebar;