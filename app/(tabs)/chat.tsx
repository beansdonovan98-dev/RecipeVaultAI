import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppText as Text } from '@/components/AppText';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useMember } from '@/hooks/useMember';
import { useRoomConfig } from '@/hooks/useRoomConfig';
import { getAuthorLabel } from '@/constants/authors';
import { isRemoteConfigured } from '@/services/remote';
import { listMessages, sendMessage, uploadChatPhoto } from '@/services/remote';
import type { RemoteMessage } from '@/types/sync';

export default function ChatScreen() {
  const { theme, displayFamily } = useAppearance();
  const member = useMember();
  const { config } = useRoomConfig();
  const [messages, setMessages] = useState<RemoteMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const lastSince = useRef<string | null>(null);
  const flatListRef = useRef<FlatList<RemoteMessage>>(null);

  const loadMessages = useCallback(async (since?: string | null) => {
    if (!config?.code) return;
    try {
      const result = await listMessages(config.code, since ?? undefined);
      if (since) {
        if (result.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const newOnes = result.filter((m) => !ids.has(m.id));
            if (newOnes.length === 0) return prev;
            const next = [...prev, ...newOnes];
            lastSince.current = next[next.length - 1].created_at;
            return next;
          });
        }
      } else {
        setMessages(result);
        if (result.length > 0) {
          lastSince.current = result[result.length - 1].created_at;
        }
      }
    } catch (error) {
      // ignore polling errors
    } finally {
      setLoading(false);
    }
  }, [config?.code]);

  useEffect(() => {
    loadMessages(null);
    const interval = setInterval(() => {
      loadMessages(lastSince.current);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingImage(result.assets[0].uri);
    }
  };

  const handlePasteGifUrl = () => {
    if (typeof (Alert as any).prompt === 'function') {
      (Alert as any).prompt(
        'GIF URL',
        'Paste a link to a GIF or image',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use',
            onPress: (url?: string) => {
              const trimmed = (url ?? '').trim();
              if (trimmed) setPendingImage(trimmed);
            },
          },
        ],
        'plain-text'
      );
    } else {
      Alert.alert('GIF URL', 'Long-press an image in your browser, copy the link, then use the image picker to select a saved GIF.');
    }
  };

  const handleSend = async () => {
    if (!config?.code || !member) return;
    if (!text.trim() && !pendingImage) return;
    setSending(true);
    try {
      let imageUrl: string | null = null;
      if (pendingImage) {
        imageUrl = await uploadChatPhoto(pendingImage);
      }
      await sendMessage(config.code, member, text.trim(), imageUrl);
      setText('');
      setPendingImage(null);
      await loadMessages(lastSince.current);
    } catch (error) {
      Alert.alert('Send failed', error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: RemoteMessage }) => {
    const isMine = item.member === member;
    const label = getAuthorLabel(item.member as any) || item.member;
    return (
      <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs, { backgroundColor: isMine ? theme.primary : theme.inputBackground }]}>
          {!isMine && (
            <Text style={[styles.sender, { color: theme.textSecondary }]}>{label}</Text>
          )}
          {item.text ? (
            <Text style={[styles.messageText, { color: isMine ? theme.white : theme.text }]}>{item.text}</Text>
          ) : null}
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.messageImage} resizeMode="cover" />
          ) : null}
          <Text style={[styles.timestamp, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (!config?.code) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textMuted }}>Join or create a shared room to use chat.</Text>
      </View>
    );
  }

  if (!isRemoteConfigured()) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textMuted }}>Shared rooms are not configured.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      {pendingImage ? (
        <View style={styles.pendingImageRow}>
          <Image source={{ uri: pendingImage }} style={styles.pendingImage} />
          <TouchableOpacity onPress={() => setPendingImage(null)} style={styles.removePending}>
            <Ionicons name="close-circle" size={24} color={theme.error} />
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.borderLight }]}>
        <TouchableOpacity onPress={handlePickImage} style={styles.iconButton} disabled={sending}>
          <Ionicons name="image-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePasteGifUrl} style={styles.iconButton} disabled={sending}>
          <Ionicons name="link-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: theme.text, fontFamily: displayFamily }]}
          placeholder="Message..."
          placeholderTextColor={theme.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendButton, { backgroundColor: theme.primary }]}
          disabled={sending || (!text.trim() && !pendingImage)}
        >
          {sending ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <Ionicons name="send" size={18} color={theme.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  listContent: { padding: 12, paddingBottom: 20 },
  bubbleRow: { flexDirection: 'row', marginBottom: 8 },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 10,
    paddingHorizontal: 12,
  },
  bubbleMine: { borderBottomRightRadius: 4 },
  bubbleTheirs: { borderBottomLeftRadius: 4 },
  sender: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageImage: { width: 200, height: 150, borderRadius: 8, marginTop: 6 },
  timestamp: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  pendingImageRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  pendingImage: { width: 80, height: 60, borderRadius: 8 },
  removePending: { marginLeft: 8 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  iconButton: { padding: 6 },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    fontSize: 15,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});