import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { Habit } from '@/contexts/habits-context';
import { C, HABIT_EMOJIS, HABIT_COLORS } from '@/constants/habitColors';

type Props = {
  visible:  boolean;
  onClose:  () => void;
  onSave:   (name: string, emoji: string, color: string) => void;
  initial?: Habit;
};

export default function HabitModal({ visible, onClose, onSave, initial }: Props) {
  const [name,  setName]  = useState('');
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0]);

  useEffect(() => {
    if (visible) {
      setName(initial?.name  ?? '');
      setEmoji(initial?.emoji ?? HABIT_EMOJIS[0]);
      setColor(initial?.color ?? HABIT_COLORS[0]);
    }
  }, [visible]);

  const save = () => {
    if (!name.trim()) return;
    onSave(name.trim(), emoji, color);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />

        <View style={s.sheet}>
          <View style={s.handle} />

          <Text style={s.title}>{initial ? 'Edit Habit' : 'New Habit'}</Text>

          {/* Preview bubble */}
          <View style={[s.preview, { backgroundColor: color + '22' }]}>
            <Text style={{ fontSize: 30 }}>{emoji}</Text>
          </View>

          {/* Emoji picker */}
          <Text style={s.label}>ICON</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.emojiScroll}
          >
            {HABIT_EMOJIS.map(e => (
              <TouchableOpacity
                key={e}
                onPress={() => setEmoji(e)}
                style={[s.emojiOpt, emoji === e && { borderColor: color, backgroundColor: color + '18' }]}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Name input */}
          <Text style={s.label}>NAME</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Drink water, Read 20 mins…"
            placeholderTextColor={C.muted}
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={save}
          />

          {/* Color picker */}
          <Text style={s.label}>COLOR</Text>
          <View style={s.colorRow}>
            {HABIT_COLORS.map(col => (
              <TouchableOpacity
                key={col}
                onPress={() => setColor(col)}
                style={[s.colorDot, { backgroundColor: col }, color === col && s.colorDotSel]}
              />
            ))}
          </View>

          {/* Actions */}
          <View style={s.btns}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: color }, !name.trim() && { opacity: 0.4 }]}
              onPress={save}
              disabled={!name.trim()}
            >
              <Text style={s.saveTxt}>{initial ? 'Save' : 'Add Habit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },

  sheet: {
    backgroundColor:      C.card,
    borderTopLeftRadius:  22,
    borderTopRightRadius: 22,
    padding:              24,
    paddingBottom:        Platform.OS === 'ios' ? 44 : 26,
    borderTopWidth:       1,
    borderColor:          C.border,
  },
  handle: {
    width:           36,
    height:          3,
    backgroundColor: C.border,
    borderRadius:    2,
    alignSelf:       'center',
    marginBottom:    18,
  },
  title: { color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 18 },

  preview: {
    width:          60,
    height:         60,
    borderRadius:   18,
    alignItems:     'center',
    justifyContent: 'center',
    alignSelf:      'center',
    marginBottom:   18,
  },

  label: {
    color:         C.muted,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1.4,
    marginBottom:  8,
  },

  emojiScroll: { marginBottom: 18 },
  emojiOpt: {
    width:           44,
    height:          44,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     8,
    borderWidth:     2,
    borderColor:     'transparent',
    backgroundColor: C.bg,
  },

  input: {
    backgroundColor: C.bg,
    color:           C.text,
    borderRadius:    12,
    padding:         13,
    fontSize:        15,
    marginBottom:    18,
    borderWidth:     1,
    borderColor:     C.border,
  },

  colorRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  colorDot:   { width: 32, height: 32, borderRadius: 16 },
  colorDotSel: { borderWidth: 3, borderColor: C.white, transform: [{ scale: 1.15 }] },

  btns:      { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex:            1,
    backgroundColor: C.bg,
    borderRadius:    12,
    paddingVertical: 14,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     C.border,
  },
  cancelTxt: { color: C.sub, fontSize: 14, fontWeight: '600' },
  saveBtn:   { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveTxt:   { color: C.white, fontSize: 14, fontWeight: '700' },
});
