import { colors , palette ,dark , light} from '@/constants/CustomColor'; 

export function useThemeColor() {
  return colors; 
}

export function usePalette() {
  return palette; 
}

export function useDark(){
  return dark; 
}

export function useLight(){
  return light; 
}
