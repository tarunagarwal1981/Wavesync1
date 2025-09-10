import React from "react";
import { useNavigation } from "../../hooks/useNavigation";
import { NavigationItem } from "../../utils/nav";

interface LayoutProps {
  title: string;
  navItems: NavigationItem[];
  user: { name: string; role: string };
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, navItems, user, children }) => {
  const { mobileOpen, setMobileOpen } = useNavigation();

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '260px 1fr', 
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* Sidebar */}
      <aside style={{
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        padding: '16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: '800',
            fontSize: '14px'
          }}>
            W
          </div>
          <span style={{ fontWeight: '800', letterSpacing: '0.2px' }}>WaveSync</span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'grid', gap: '6px' }}>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                color: '#374151',
                textDecoration: 'none',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#e5e7eb',
            display: 'grid',
            placeItems: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#6b7280'
          }}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {user.role}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        display: 'grid', 
        gridTemplateRows: 'auto 1fr',
        background: '#f9fafb'
      }}>
        {/* Header */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '800', 
            color: '#111827',
            margin: 0
          }}>
            {title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search crew, vessels, tasks..."
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                minWidth: '240px',
                background: '#f9fafb'
              }}
            />
            
            {/* Notifications */}
            <button style={{
              width: '36px',
              height: '36px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}>
              🔔
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                3
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;