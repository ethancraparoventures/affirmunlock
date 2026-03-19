import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  Switch,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useAppContext } from "@/lib/app-context";
import {
  Affirmation,
  STANDARD_AFFIRMATIONS,
  addAffirmation,
  updateAffirmation,
  deleteAffirmation,
  addStandardAffirmation,
} from "@/lib/affirmations-store";
import { ScreenContainer } from "@/components/screen-container";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  LotusIcon,
} from "@/components/ui/spa-icons";

// Earthy palette
const C = {
  bg: "#F7F3EC",
  surface: "#EDE8DF",
  border: "#D6CEBF",
  fg: "#2C2416",
  muted: "#8C7B6B",
  subtle: "#B8A898",
  sage: "#7A9E7E",
  sageDark: "#5C7D60",
  tan: "#C4A882",
  terracotta: "#B5705A",
  cream: "#F7F3EC",
};

interface EditModalProps {
  visible: boolean;
  affirmation: Affirmation | null;
  onClose: () => void;
  onSave: (text: string) => void;
}

function EditModal({ visible, affirmation, onClose, onSave }: EditModalProps) {
  const [text, setText] = useState(affirmation?.text ?? "");

  React.useEffect(() => {
    setText(affirmation?.text ?? "");
  }, [affirmation]);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>
            {affirmation ? "Edit Affirmation" : "New Affirmation"}
          </Text>

          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={(t) => setText(t.slice(0, 120))}
            placeholder="I am confident and capable..."
            placeholderTextColor={C.subtle}
            multiline
            autoFocus
            maxLength={120}
            returnKeyType="done"
          />
          <Text style={styles.charCount}>{text.length}/120</Text>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for great affirmations</Text>
            <Text style={styles.tipItem}>Speak in first person — "I am..."</Text>
            <Text style={styles.tipItem}>Use present tense, not future</Text>
            <Text style={styles.tipItem}>Make it personal and meaningful</Text>
          </View>

          <View style={styles.modalButtons}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.7 }]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                !text.trim() && styles.saveButtonDisabled,
                pressed && text.trim() && { opacity: 0.8 },
              ]}
              onPress={handleSave}
              disabled={!text.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function AffirmationsScreen() {
  const { affirmations, refreshAffirmations } = useAppContext();
  const [editModal, setEditModal] = useState<{ visible: boolean; affirmation: Affirmation | null }>({
    visible: false,
    affirmation: null,
  });
  const [showStandard, setShowStandard] = useState(false);

  const addedStandardIds = new Set(affirmations.map((a) => a.id));

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditModal({ visible: true, affirmation: null });
  };

  const handleEdit = (affirmation: Affirmation) => {
    setEditModal({ visible: true, affirmation });
  };

  const handleSave = async (text: string) => {
    if (editModal.affirmation) {
      await updateAffirmation(editModal.affirmation.id, { text });
    } else {
      await addAffirmation(text);
    }
    await refreshAffirmations();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (affirmation: Affirmation) => {
    Alert.alert(
      "Remove Affirmation",
      "Are you sure you want to remove this affirmation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deleteAffirmation(affirmation.id);
            await refreshAffirmations();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const handleToggleActive = async (affirmation: Affirmation) => {
    await updateAffirmation(affirmation.id, { active: !affirmation.active });
    await refreshAffirmations();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddStandard = async (id: string) => {
    await addStandardAffirmation(id);
    await refreshAffirmations();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderAffirmationItem = ({ item }: { item: Affirmation }) => (
    <View style={[styles.affirmationCard, !item.active && styles.affirmationCardInactive]}>
      <View style={styles.affirmationCardContent}>
        <Text style={[styles.affirmationCardText, !item.active && styles.affirmationCardTextInactive]}>
          {item.text}
        </Text>
        <View style={styles.affirmationCardActions}>
          <Switch
            value={item.active}
            onValueChange={() => handleToggleActive(item)}
            trackColor={{ false: C.border, true: C.sage }}
            thumbColor={item.active ? C.cream : C.subtle}
          />
          <Pressable
            style={({ pressed }) => [styles.iconActionBtn, pressed && { opacity: 0.6 }]}
            onPress={() => handleEdit(item)}
          >
            <PencilIcon size={18} color={C.muted} strokeWidth={1.5} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconActionBtn, pressed && { opacity: 0.6 }]}
            onPress={() => handleDelete(item)}
          >
            <TrashIcon size={18} color={C.terracotta} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>Affirmations</Text>
          <Text style={styles.screenSubtitle}>
            {affirmations.filter((a) => a.active).length} active
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && { transform: [{ scale: 0.95 }] }]}
          onPress={handleAdd}
        >
          <PlusCircleIcon size={18} color={C.cream} strokeWidth={1.6} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={affirmations}
        keyExtractor={(item) => item.id}
        renderItem={renderAffirmationItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LotusIcon size={48} color={C.subtle} strokeWidth={1.3} />
            <Text style={styles.emptyTitle}>No affirmations yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your own or pick from the library below.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.standardSection}>
            <Pressable
              style={styles.standardHeader}
              onPress={() => setShowStandard((v) => !v)}
            >
              <Text style={styles.standardTitle}>Affirmation Library</Text>
              <ChevronRightIcon
                size={18}
                color={C.muted}
                strokeWidth={1.6}
              />
            </Pressable>
            <Text style={styles.standardSubtitle}>
              Tap any to add to your personal list
            </Text>

            {showStandard &&
              STANDARD_AFFIRMATIONS.map((std) => {
                const alreadyAdded = addedStandardIds.has(std.id);
                return (
                  <Pressable
                    key={std.id}
                    style={({ pressed }) => [
                      styles.standardItem,
                      alreadyAdded && styles.standardItemAdded,
                      pressed && !alreadyAdded && { opacity: 0.7 },
                    ]}
                    onPress={() => !alreadyAdded && handleAddStandard(std.id)}
                    disabled={alreadyAdded}
                  >
                    <Text
                      style={[
                        styles.standardItemText,
                        alreadyAdded && styles.standardItemTextAdded,
                      ]}
                    >
                      {std.text}
                    </Text>
                    {alreadyAdded ? (
                      <CheckCircleIcon size={18} color={C.sageDark} strokeWidth={1.5} />
                    ) : (
                      <PlusCircleIcon size={18} color={C.sage} strokeWidth={1.5} />
                    )}
                  </Pressable>
                );
              })}
          </View>
        }
      />

      <EditModal
        visible={editModal.visible}
        affirmation={editModal.affirmation}
        onClose={() => setEditModal({ visible: false, affirmation: null })}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: C.fg,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: C.sage,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addButtonText: {
    color: C.cream,
    fontSize: 15,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  affirmationCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  affirmationCardInactive: {
    opacity: 0.5,
  },
  affirmationCardContent: {
    gap: 12,
  },
  affirmationCardText: {
    fontSize: 15,
    color: C.fg,
    lineHeight: 22,
  },
  affirmationCardTextInactive: {
    color: C.muted,
  },
  affirmationCardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: C.fg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  standardSection: {
    marginTop: 24,
    gap: 8,
  },
  standardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  standardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: C.fg,
    letterSpacing: -0.2,
  },
  standardSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginBottom: 4,
  },
  standardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  standardItemAdded: {
    opacity: 0.6,
    borderColor: C.sage,
  },
  standardItemText: {
    flex: 1,
    fontSize: 14,
    color: C.fg,
    lineHeight: 20,
  },
  standardItemTextAdded: {
    color: C.muted,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(44,36,22,0.4)",
  },
  modalSheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: C.fg,
    letterSpacing: -0.3,
  },
  textInput: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: C.fg,
    borderWidth: 1.5,
    borderColor: C.sage,
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    color: C.muted,
    textAlign: "right",
    marginTop: -8,
  },
  tipsContainer: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipItem: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 19,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: C.muted,
    fontWeight: "500",
  },
  saveButton: {
    flex: 2,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.sage,
  },
  saveButtonDisabled: {
    backgroundColor: C.border,
  },
  saveButtonText: {
    fontSize: 16,
    color: C.cream,
    fontWeight: "600",
  },
});
