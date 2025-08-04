import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Moon, Sun, Menu } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
}

const AppNavbar: React.FC<NavbarProps> = ({ darkMode, onToggleDarkMode, onToggleSidebar }) => {
  return (
    <Navbar bg={darkMode ? 'dark' : 'light'} variant={darkMode ? 'dark' : 'light'} expand="lg" className="border-bottom">
      <Container fluid>
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-lg-none me-2"
          onClick={onToggleSidebar}
        >
          <Menu size={18} />
        </Button>
        
        <Navbar.Brand href="#" className="gradient-bg bg-clip-text">
          SubTrackr
        </Navbar.Brand>
        
        <Nav className="ms-auto">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onToggleDarkMode}
            className="d-flex align-items-center"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;