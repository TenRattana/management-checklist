import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}


// import { colors , palette ,dark , light} from '@/constants/CustomColor'; 

// export function useThemeColor() {
//   return colors; 
// }

// export function usePalette() {
//   return palette; 
// }

// export function useDark(){
//   return dark; 
// }

// export function useLight(){
//   return light; 
// }
