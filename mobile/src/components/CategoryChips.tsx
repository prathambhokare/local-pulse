import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, radius, spacing } from "../theme";

interface Props {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  showAllOption?: boolean;
}

export function CategoryChips({ categories, selected, onSelect, showAllOption = true }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {showAllOption && (
        <TouchableOpacity
          style={[styles.chip, selected === null && styles.chipActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.chipText, selected === null && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
      )}
      {categories.map((category) => {
        const isActive = selected === category;
        return (
          <TouchableOpacity
            key={category}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(isActive ? null : category)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{category}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
});
