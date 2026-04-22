import { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

type Props = {
  focused: boolean;
  children: React.ReactNode;
};

export default function AnimatedTabIcon({ focused, children }: Props) {
  const scale = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  const translateY = useRef(new Animated.Value(focused ? -2 : 0)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.12 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 140,
      }),
      Animated.spring(translateY, {
        toValue: focused ? -3 : 0,
        useNativeDriver: true,
        friction: 6,
        tension: 140,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.8,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, translateY, opacity]);

  const style: Animated.WithAnimatedObject<ViewStyle> = {
    transform: [{ scale }, { translateY }],
    opacity,
  };

  return <Animated.View style={style}>{children}</Animated.View>;
}