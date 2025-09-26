import { Button, cn } from '@heroui/react';
import { LucideIcon } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router';

type NavLinkProps = {
  url: string;
  title: string;
  icon: LucideIcon | (() => React.ReactNode);
  className?: string;
};

const NavLink = ({ url, title, icon: Icon, className }: NavLinkProps) => {
  const location = useLocation();
  return (
    <Button
      as={Link}
      to={url}
      variant={location.pathname.startsWith(url) ? 'flat' : 'light'}
      fullWidth
      radius="sm"
      className={cn('justify-start', className)}>
      <Icon className="text-lg" /> {title}
    </Button>
  );
};

export default NavLink;
