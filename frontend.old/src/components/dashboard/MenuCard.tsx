import { useNavigate } from 'react-router-dom';

interface MenuCardProps {
  icon: string;
  title: string;
  description: string;
  path: string;
  color: string;
}

export default function MenuCard({ icon, title, description, path, color }: MenuCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className={`${color} rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="text-sm text-white/90">{description}</p>
    </div>
  );
}
