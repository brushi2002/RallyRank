import { TextStyle, ViewStyle } from 'react-native';

type Style = ViewStyle | TextStyle;

export const tw = (classes: string): Style[] => {
  const classMap: Record<string, Style> = {
    // Flexbox
    'flex-1': { flex: 1 },
    'flex-row': { flexDirection: 'row' },
    'flex-col': { flexDirection: 'column' },
    'justify-center': { justifyContent: 'center' },
    'justify-between': { justifyContent: 'space-between' },
    'justify-around': { justifyContent: 'space-around' },
    'justify-start': { justifyContent: 'flex-start' },
    'justify-end': { justifyContent: 'flex-end' },
    'items-center': { alignItems: 'center' },
    'items-start': { alignItems: 'flex-start' },
    'items-end': { alignItems: 'flex-end' },
    'items-stretch': { alignItems: 'stretch' },
    
    // Background colors
    'bg-transparent': { backgroundColor: 'transparent' },
    'bg-white': { backgroundColor: '#ffffff' },
    'bg-black': { backgroundColor: '#000000' },
    'bg-gray-50': { backgroundColor: '#f9fafb' },
    'bg-gray-100': { backgroundColor: '#f3f4f6' },
    'bg-gray-200': { backgroundColor: '#e5e7eb' },
    'bg-gray-300': { backgroundColor: '#d1d5db' },
    'bg-gray-400': { backgroundColor: '#9ca3af' },
    'bg-gray-500': { backgroundColor: '#6b7280' },
    'bg-gray-600': { backgroundColor: '#4b5563' },
    'bg-gray-700': { backgroundColor: '#374151' },
    'bg-gray-800': { backgroundColor: '#1f2937' },
    'bg-gray-900': { backgroundColor: '#111827' },
    'bg-red-500': { backgroundColor: '#ef4444' },
    'bg-red-600': { backgroundColor: '#dc2626' },
    'bg-blue-500': { backgroundColor: '#3b82f6' },
    'bg-blue-600': { backgroundColor: '#2563eb' },
    'bg-green-500': { backgroundColor: '#10b981' },
    'bg-green-600': { backgroundColor: '#059669' },
    'bg-yellow-500': { backgroundColor: '#f59e0b' },
    'bg-purple-500': { backgroundColor: '#8b5cf6' },
    'bg-pink-500': { backgroundColor: '#ec4899' },
    'bg-indigo-500': { backgroundColor: '#6366f1' },
    
    // Text colors
    'text-white': { color: '#ffffff' },
    'text-black': { color: '#000000' },
    'text-gray-100': { color: '#f3f4f6' },
    'text-gray-200': { color: '#e5e7eb' },
    'text-gray-300': { color: '#d1d5db' },
    'text-gray-400': { color: '#9ca3af' },
    'text-gray-500': { color: '#6b7280' },
    'text-gray-600': { color: '#4b5563' },
    'text-gray-700': { color: '#374151' },
    'text-gray-800': { color: '#1f2937' },
    'text-gray-900': { color: '#111827' },
    'text-red-500': { color: '#ef4444' },
    'text-blue-500': { color: '#3b82f6' },
    'text-green-500': { color: '#10b981' },
    'text-yellow-500': { color: '#f59e0b' },
    'text-purple-500': { color: '#8b5cf6' },
    
    // Font sizes
    'text-xs': { fontSize: 12 },
    'text-sm': { fontSize: 14 },
    'text-base': { fontSize: 16 },
    'text-lg': { fontSize: 18 },
    'text-xl': { fontSize: 20 },
    'text-2xl': { fontSize: 24 },
    'text-3xl': { fontSize: 30 },
    'text-4xl': { fontSize: 36 },
    
    // Font weights
    'font-thin': { fontWeight: '100' },
    'font-light': { fontWeight: '300' },
    'font-normal': { fontWeight: '400' },
    'font-medium': { fontWeight: '500' },
    'font-semibold': { fontWeight: '600' },
    'font-bold': { fontWeight: '700' },
    'font-extrabold': { fontWeight: '800' },
    
    // Text alignment
    'text-left': { textAlign: 'left' },
    'text-center': { textAlign: 'center' },
    'text-right': { textAlign: 'right' },
    
    // Padding
    'p-0': { padding: 0 },
    'p-1': { padding: 4 },
    'p-2': { padding: 8 },
    'p-3': { padding: 12 },
    'p-4': { padding: 16 },
    'p-5': { padding: 20 },
    'p-6': { padding: 24 },
    'p-8': { padding: 32 },
    'px-1': { paddingHorizontal: 4 },
    'px-2': { paddingHorizontal: 8 },
    'px-3': { paddingHorizontal: 12 },
    'px-4': { paddingHorizontal: 16 },
    'px-5': { paddingHorizontal: 20 },
    'px-6': { paddingHorizontal: 24 },
    'py-1': { paddingVertical: 4 },
    'py-2': { paddingVertical: 8 },
    'py-3': { paddingVertical: 12 },
    'py-4': { paddingVertical: 16 },
    'py-5': { paddingVertical: 20 },
    'py-6': { paddingVertical: 24 },
    'pt-1': { paddingTop: 4 },
    'pt-2': { paddingTop: 8 },
    'pt-4': { paddingTop: 16 },
    'pb-1': { paddingBottom: 4 },
    'pb-2': { paddingBottom: 8 },
    'pb-4': { paddingBottom: 16 },
    'pl-1': { paddingLeft: 4 },
    'pl-2': { paddingLeft: 8 },
    'pl-4': { paddingLeft: 16 },
    'pr-1': { paddingRight: 4 },
    'pr-2': { paddingRight: 8 },
    'pr-4': { paddingRight: 16 },
    
    // Margin
    'm-0': { margin: 0 },
    'm-1': { margin: 4 },
    'm-2': { margin: 8 },
    'm-3': { margin: 12 },
    'm-4': { margin: 16 },
    'm-5': { margin: 20 },
    'm-6': { margin: 24 },
    'm-8': { margin: 32 },
    'mx-1': { marginHorizontal: 4 },
    'mx-2': { marginHorizontal: 8 },
    'mx-3': { marginHorizontal: 12 },
    'mx-4': { marginHorizontal: 16 },
    'mx-auto': { marginHorizontal: 'auto' },
    'my-1': { marginVertical: 4 },
    'my-2': { marginVertical: 8 },
    'my-3': { marginVertical: 12 },
    'my-4': { marginVertical: 16 },
    'mt-1': { marginTop: 4 },
    'mt-2': { marginTop: 8 },
    'mt-3': { marginTop: 12 },
    'mt-4': { marginTop: 16 },
    'mt-6': { marginTop: 24 },
    'mt-8': { marginTop: 32 },
    'mb-1': { marginBottom: 4 },
    'mb-2': { marginBottom: 8 },
    'mb-3': { marginBottom: 12 },
    'mb-4': { marginBottom: 16 },
    'mb-6': { marginBottom: 24 },
    'mb-8': { marginBottom: 32 },
    'ml-1': { marginLeft: 4 },
    'ml-2': { marginLeft: 8 },
    'ml-4': { marginLeft: 16 },
    'mr-1': { marginRight: 4 },
    'mr-2': { marginRight: 8 },
    'mr-4': { marginRight: 16 },
    
    // Width & Height
    'w-full': { width: '100%' },
    'w-1/2': { width: '50%' },
    'w-1/3': { width: '33.333%' },
    'w-2/3': { width: '66.666%' },
    'w-1/4': { width: '25%' },
    'w-3/4': { width: '75%' },
    'h-full': { height: '100%' },
    'h-1/2': { height: '50%' },
    'h-1/3': { height: '33.333%' },
    'h-2/3': { height: '66.666%' },
    'h-1/4': { height: '25%' },
    'h-3/4': { height: '75%' },
    
    // Border radius
    'rounded-none': { borderRadius: 0 },
    'rounded-sm': { borderRadius: 2 },
    'rounded': { borderRadius: 4 },
    'rounded-md': { borderRadius: 6 },
    'rounded-lg': { borderRadius: 8 },
    'rounded-xl': { borderRadius: 12 },
    'rounded-2xl': { borderRadius: 16 },
    'rounded-3xl': { borderRadius: 24 },
    'rounded-full': { borderRadius: 9999 },
    
    // Border width
    'border': { borderWidth: 1 },
    'border-0': { borderWidth: 0 },
    'border-2': { borderWidth: 2 },
    'border-4': { borderWidth: 4 },
    
    // Border colors
    'border-gray-200': { borderColor: '#e5e7eb' },
    'border-gray-300': { borderColor: '#d1d5db' },
    'border-gray-400': { borderColor: '#9ca3af' },
    'border-red-500': { borderColor: '#ef4444' },
    'border-blue-500': { borderColor: '#3b82f6' },
    
    // Position
    'absolute': { position: 'absolute' },
    'relative': { position: 'relative' },
    
    // Top, right, bottom, left
    'top-0': { top: 0 },
    'right-0': { right: 0 },
    'bottom-0': { bottom: 0 },
    'left-0': { left: 0 },
    
    // Shadow (basic implementation)
    'shadow-sm': { 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    'shadow': { 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    'shadow-lg': { 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    
    // Opacity
    'opacity-0': { opacity: 0 },
    'opacity-25': { opacity: 0.25 },
    'opacity-50': { opacity: 0.5 },
    'opacity-75': { opacity: 0.75 },
    'opacity-100': { opacity: 1 },
    
    // Z-index
    'z-10': { zIndex: 10 },
    'z-20': { zIndex: 20 },
    'z-30': { zIndex: 30 },
    'z-40': { zIndex: 40 },
    'z-50': { zIndex: 50 },
  };

  return classes.split(' ').map(cls => classMap[cls.trim()]).filter(Boolean);
};

// Alternative function that merges styles into a single object
export const twMerge = (classes: string): Style => {
  const styles = tw(classes);
  return Object.assign({}, ...styles);
};