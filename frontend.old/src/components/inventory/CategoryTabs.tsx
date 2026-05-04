interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const categories = [
    { value: 'block', label: 'BLOCK' },
    { value: 'paper', label: 'PAPER' },
    { value: 'other_material', label: 'OTHER MATERIAL' },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeCategory === cat.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
