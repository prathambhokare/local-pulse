import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

const OPTIONS = [5, 10, 20, 50];

interface Props {
  radiusKm: number;
  noRadius: boolean;
  onChangeRadius: (radiusKm: number) => void;
  onToggleNoRadius: () => void;
}

export function RadiusSelector({ radiusKm, noRadius, onChangeRadius, onToggleNoRadius }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const isActive = !noRadius && radiusKm === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChangeRadius(option)}
          >
            <Feather name="map-pin" size={13} color={isActive ? "#fff" : colors.textMuted} />
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {option} km
            </Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        style={[styles.chip, noRadius && styles.chipActive]}
        onPress={onToggleNoRadius}
      >
        <Feather name="globe" size={13} color={noRadius ? "#fff" : colors.textMuted} />
        <Text style={[styles.chipText, noRadius && styles.chipTextActive]}>All areas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  chipTextActive: {
    color: "#fff",
  },
});
