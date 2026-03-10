import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo, memo } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  details?: { label: string; value: number | string; color?: string }[];
  glowColor: 'cyan' | 'magenta' | 'yellow' | 'green';
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, details, glowColor, onClick }: StatCardProps) {
  const glowClass = useMemo(() => `glow-${glowColor}`, [glowColor]);

  // Animated number counting
  const spring = useSpring(0, { duration: 1000 });
  const display = useTransform(spring, (current) =>
    typeof value === 'number' ? Math.round(current).toLocaleString() : value
  );

  useEffect(() => {
    if (typeof value === 'number') {
      spring.set(value);
    }
  }, [spring, value]);

  const detailsContent = useMemo(() => {
    if (!details || details.length === 0) return null;
    return (
      <div className="mt-4 text-sm text-gray-400 space-y-1">
        {details.map((detail, index) => (
          <div key={index}>
            {detail.label}: <span className={`font-mono ${detail.color || 'text-gray-300'}`}>{detail.value}</span>
          </div>
        ))}
      </div>
    );
  }, [details]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card rounded-xl p-6 transition-all duration-300 cursor-pointer ${glowClass}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      aria-label={`${title}: ${value}`}
    >
      <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wider">
        {title}
      </h3>

      <motion.p className="text-4xl font-bold mt-3 text-white font-mono">
        {typeof value === 'number' ? (
          <motion.span>{display}</motion.span>
        ) : (
          value
        )}
      </motion.p>

      {subtitle && (
        <p className="mt-4 text-sm text-gray-400">{subtitle}</p>
      )}

      {detailsContent}
    </motion.div>
  );
}

export default memo(StatCard);
