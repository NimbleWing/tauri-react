import React, { useState } from 'react';

export type UseSelection<T> = {
  values: T[];
  set: React.Dispatch<React.SetStateAction<T[]>>;
  isSelected: (data: T) => boolean;
  toggle: (data: T, previouslySelected?: boolean) => void;
  clear: () => void;
};

export const useSelection = <T>(isEqual: (a: T, b: T) => boolean): UseSelection<T> => {
  const [values, set] = useState<T[]>([]);
  const isSelected = (data: T) => values.some(t => isEqual(t, data));
  const clear = () => set([]);
  const toggle = (data: T, previouslySelected?: boolean) => {
    if (previouslySelected) {
      set(state => state.filter(t => !isEqual(t, data)));
    } else {
      set(state => state.concat(data));
    }
  };
  return { values, set, isSelected, toggle, clear };
};
