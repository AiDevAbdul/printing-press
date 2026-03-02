import MenuCard from './MenuCard';

interface MenuCardData {
  icon: string;
  title: string;
  description: string;
  path: string;
  color: string;
}

interface MenuGroupProps {
  title: string;
  icon: string;
  cards: MenuCardData[];
}

export default function MenuGroup({ title, icon, cards }: MenuGroupProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <MenuCard key={card.path} {...card} />
        ))}
      </div>
    </div>
  );
}
