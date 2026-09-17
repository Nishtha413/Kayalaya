import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './AppText';
import Icon from './Icon';
import { s, v, f } from '../utils/responsive';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  secure?: boolean;
  multilineHeight?: number;
  uppercaseLabel?: boolean;
}

export default function TextField({
  label,
  error,
  secure = false,
  multilineHeight,
  uppercaseLabel = false,
  style,
  ...rest
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);
  const hasError = Boolean(error);
  const didSetVisit = useRef(false);

  const keyboardType: KeyboardTypeOptions = rest.keyboardType ?? 'default';

  useEffect(() => {
    if (error && !didSetVisit.current) {
      didSetVisit.current = true;
    }
  }, [error]);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText
          variant="caption"
          color={colors.textMuted}
          style={[
            styles.label,
            uppercaseLabel && styles.labelUppercase,
          ]}
        >
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            borderColor: hasError
              ? colors.danger
              : focused
                ? colors.primary
                : colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <TextInput
          {...rest}
          keyboardType={keyboardType}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.textFaint}
style={[
              styles.input,
              {
                color: colors.text,
                minHeight: v(multilineHeight ?? 48),
              textAlignVertical: multilineHeight ? 'top' : 'center',
              paddingTop: multilineHeight ? 12 : 0,
            },
            style,
          ]}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={12} style={styles.eye}>
            <Icon name={hidden ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginBottom: v(16) },
  label: { marginBottom: v(6), marginLeft: 2 },
  labelUppercase: {
    textTransform: 'uppercase',
    fontSize: f(11),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: s(12),
    paddingHorizontal: s(13),
  },
  input: { flex: 1, fontSize: f(16), paddingVertical: 0 },
  eye: { marginLeft: 8 },
  error: { marginTop: v(6), marginLeft: 2 },
});