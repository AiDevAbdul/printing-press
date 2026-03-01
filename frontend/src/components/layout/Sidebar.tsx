import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Customers', path: '/customers', icon: '👥' },
    { name: 'Quotations', path: '/quotations', icon: '📄' },
    { name: 'Orders', path: '/orders', icon: '📦' },
    { name: 'Production', path: '/production', icon: '🏭' },
    { name: 'Inventory', path: '/inventory', icon: '📋' },
    { name: 'Costing', path: '/costing', icon: '💵' },
    { name: 'Invoices', path: '/invoices', icon: '💰' },
    { name: 'Users', path: '/users', icon: '👤' },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Printing Press</h1>
        <p className="text-sm text-gray-400">Management System</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center space-x-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-3">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
