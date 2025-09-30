import { Button, Card } from '@heroui/react';
import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDownIcon, ChevronUpIcon, LucideIcon } from 'lucide-react';
interface CollapsibleCardProps {
  icon: LucideIcon;
  title: string | ReactNode;
  children: ReactNode;
  className?: string;
}
export const CollapsibleCard = ({ icon: Icon, title, children, className = '' }: CollapsibleCardProps) => {
  const storageKey = `hyp-card-collapsed-${typeof title === 'string' ? title : ''}`;
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : false;
  });
  const handleCollapse = (value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem(storageKey, JSON.stringify(value));
  };
  return (
    <Card shadow="none" className={`flex flex-col p-2 md:p-4 relative ${className}`}>
      <div></div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon />
          <div className="font-bold">{title}</div>
        </div>
        <Button size="sm" isIconOnly variant="flat" onPress={() => handleCollapse(!isCollapsed)}>
          {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </Button>
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
