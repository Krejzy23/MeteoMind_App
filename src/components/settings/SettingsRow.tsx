import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
};

export default function SettingsRow({
  label,
  value,
  onPress,
  right,
  danger = false,
}: Props) {
  const content = ({ pressed }: { pressed: boolean }) => (
    <View
      className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
        danger
          ? "border-red-500/20 bg-red-950/30"
          : "border-white/8 bg-slate-950/35"
      } ${pressed ? "opacity-80" : "opacity-100"}`}
    >
      <Text
        className={
          danger
            ? "font-medium text-red-300"
            : "font-medium text-white"
        }
      >
        {label}
      </Text>

      {right ? (
        right
      ) : (
        <Text className="ml-4 text-right text-slate-400">
          {value ?? ""}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content({ pressed: false });
}