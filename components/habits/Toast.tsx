import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { ToggleResult } from '@/contexts/habits-context';
import { C } from '@/constants/habitColors';

type Props = {
  result: ToggleResult | null;
  onHide: () => void;
};

export default function Toast({ result, onHide }: Props) {
  const ty = useRef(new Animated.Value(-70)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!result) return;
    ty.setValue(-70);
    op.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(ty, { toValue: 0, useNativeDriver: true, tension: 180, friction: 14 }),
        Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(ty, { toValue: -70, duration: 260, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0,   duration: 260, useNativeDriver: true }),
      ]),
    ]).start(() => onHide());
  }, [result]);

  if (!result) return null;

  return (
    <Animated.View style={[s.wrap, { transform: [{ translateY: ty }], opacity: op }]}>
      <Text style={s.pts}>+{result.pointsEarned} pts</Text>
      <Text style={s.msg}>{result.message}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position:        'absolute',
    top:             10,
    left:            20,
    right:           20,
    zIndex:          999,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    backgroundColor: C.card,
    borderRadius:    12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth:     1,
    borderColor:     C.border,
  },
  pts: { color: C.gold, fontWeight: '700', fontSize: 14 },
  msg: { color: C.text, fontSize: 13, flex: 1 },
});
