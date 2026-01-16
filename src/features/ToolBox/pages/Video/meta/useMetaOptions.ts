import { getTags } from '@/features/HYP';
import { useQuery } from '@tanstack/react-query';
export const useTags = () => useQuery({ queryKey: ['tags'], queryFn: getTags });
