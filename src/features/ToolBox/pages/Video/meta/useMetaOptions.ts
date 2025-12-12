import { getTags } from '@/features/HYP';
import { useQuery } from '@tanstack/react-query';
export const useTags = () => useQuery({ queryKey: ['tags'], queryFn: getTags });
// export const usePerformers = () => useQuery({ queryKey: ['performers'], queryFn: getPerformers });
// export const useStudio = () => useQuery({ queryKey: ['studio'], queryFn: getStudio });
// export const useCountry = () => useQuery({ queryKey: ['country'], queryFn: getCountry });
