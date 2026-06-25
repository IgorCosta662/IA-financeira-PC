export interface ThemeClasses {
  bg: string;
  bgHover: string;
  text: string;
  textHover: string;
  border: string;
  borderFocus: string;
  ring: string;
  bgLight: string;
  textLight: string;
  accent: string;
  shadow: string;
}

export const getThemeClasses = (color: 'blue' | 'purple' | 'emerald' | 'slate' | string): ThemeClasses => {
  switch (color) {
    case 'purple':
      return {
        bg: 'bg-purple-600',
        bgHover: 'hover:bg-purple-700',
        text: 'text-purple-600',
        textHover: 'hover:text-purple-700',
        border: 'border-purple-200',
        borderFocus: 'focus:border-purple-500',
        ring: 'focus:ring-purple-500',
        bgLight: 'bg-purple-50',
        textLight: 'text-purple-700',
        accent: 'accent-purple-600',
        shadow: 'shadow-purple-600/10',
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-700',
        text: 'text-emerald-600',
        textHover: 'hover:text-emerald-700',
        border: 'border-emerald-200',
        borderFocus: 'focus:border-emerald-500',
        ring: 'focus:ring-emerald-500',
        bgLight: 'bg-emerald-50',
        textLight: 'text-emerald-700',
        accent: 'accent-emerald-600',
        shadow: 'shadow-emerald-600/10',
      };
    case 'slate':
      return {
        bg: 'bg-slate-700',
        bgHover: 'hover:bg-slate-800',
        text: 'text-slate-700',
        textHover: 'hover:text-slate-800',
        border: 'border-slate-300',
        borderFocus: 'focus:border-slate-500',
        ring: 'focus:ring-slate-500',
        bgLight: 'bg-slate-100',
        textLight: 'text-slate-800',
        accent: 'accent-slate-700',
        shadow: 'shadow-slate-700/10',
      };
    case 'blue':
    default:
      return {
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        textHover: 'hover:text-blue-700',
        border: 'border-blue-200',
        borderFocus: 'focus:border-blue-500',
        ring: 'focus:ring-blue-500',
        bgLight: 'bg-blue-50',
        textLight: 'text-blue-700',
        accent: 'accent-blue-600',
        shadow: 'shadow-blue-600/10',
      };
  }
};
