import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTIONS = [
  "What's the total energy capacity?",
  'Please prepare my energy balance for the past week',
  'Prepare optimisation suggestions',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // 1. Zmiana: Dodajemy 'output3' i ustawiamy jako domyślny stan
  const [ziutekPhase, setZiutekPhase] = useState<'output3' | 'idle' | 'output2' | 'hidden'>('output3');
  const flatRef = useRef<FlatList>(null);

  const fetchVoltusResponse = async (prompt: string): Promise<string> => {
    const url = `/api/chat/pradus?message=${encodeURIComponent(prompt)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Serwer zwrócił błąd: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data === 'string') {
      return data;
    }

    if (data?.status === 'success') {
      const summary = data.ui_components?.ai_copilot_panel?.executive_summary ?? '';
      const dsr = data.ui_components?.ai_copilot_panel?.dsr_action ?? '';
      const explain = data.explainable_ai ?? '';
      return [summary, dsr, explain].filter(Boolean).join('\n\n');
    }

    if (data?.message) {
      return `${data.status ?? 'error'}: ${data.message}`;
    }

    return JSON.stringify(data, null, 2);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await fetchVoltusResponse(text);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // 2. Zmiana: Jeśli jesteśmy w dowolnym stanie innym niż output2, przełącz na animację mówienia
      if (ziutekPhase !== 'output2') {
        setZiutekPhase('output2');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: `Błąd: ${errorMessage}` };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isLoading]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.role === 'user' ? styles.msgRowUser : styles.msgRowAI]}>
      {item.role === 'assistant' && (
        <View style={styles.avatar}>
          <Ionicons name="chatbubbles" size={14} color={Colors.accentCyan} />
        </View>
      )}
      <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, item.role === 'user' ? styles.textUser : styles.textAI]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Ionicons name="chatbubbles" size={20} color={Colors.accentCyan} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Prąduś AI</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isLoading && styles.statusDotThinking]} />
            <Text style={styles.statusText}>{isLoading ? 'Thinking...' : 'Ready'}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        ListHeaderComponent={() => (
          <View style={styles.welcomeArea}>
            
            {/* 3. Zmiana: Obsługa początkowej animacji (output3) */}
            {ziutekPhase === 'output3' && (
              <Video
                source={require('../../assets/ziutek/output3.webm')}
                style={styles.ziutekVideo}
                shouldPlay
                isLooping={false} // Odtwarzamy tylko raz
                isMuted
                resizeMode={ResizeMode.COVER}
                onPlaybackStatusUpdate={(status) => {
                  // Kiedy powitanie się skończy, przechodzimy do animacji idle (output1)
                  if ('didJustFinish' in status && status.didJustFinish) {
                    setZiutekPhase('idle');
                  }
                }}
              />
            )}

            {/* Ziutek video - Idle */}
            {ziutekPhase === 'idle' && (
              <Video
                source={require('../../assets/ziutek/output1.webm')}
                style={styles.ziutekVideo}
                shouldPlay
                isLooping
                isMuted
                resizeMode={ResizeMode.COVER}
              />
            )}

            {/* Ziutek video - Mówienie po odpowiedzi */}
            {ziutekPhase === 'output2' && (
              <Video
                source={require('../../assets/ziutek/output2.webm')}
                style={styles.ziutekVideo}
                shouldPlay
                isLooping={false}
                isMuted
                resizeMode={ResizeMode.COVER}
                onPlaybackStatusUpdate={(status) => {
                  if ('didJustFinish' in status && status.didJustFinish) {
                    setZiutekPhase('hidden');
                  }
                }}
              />
            )}

            {messages.length === 0 && (
              <>
                <Text style={styles.welcomeTitle}>Prąduś AI</Text>
                <Text style={styles.welcomeDesc}>Ask me anything about energy data, facilities, or regions.</Text>
                <View style={styles.suggestions}>
                  {SUGGESTIONS.map((s, i) => (
                    <TouchableOpacity key={i} style={styles.suggestionBtn} onPress={() => sendMessage(s)}>
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
        ListFooterComponent={() =>
          isLoading ? (
            <View style={[styles.msgRow, styles.msgRowAI]}>
              <View style={styles.avatar}>
                <Ionicons name="chatbubbles" size={14} color={Colors.accentCyan} />
              </View>
              <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.dot, { opacity: 0.4 + (i * 0.2) }]} />
                  ))}
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={styles.inputArea}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about energy data..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, input.trim() ? styles.sendBtnActive : null]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={16} color={input.trim() ? '#fff' : Colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Powered by Prąduś AI</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    paddingTop: 48,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34,211,238,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  statusDotThinking: { backgroundColor: Colors.accentAmber },
  statusText: { fontSize: FontSize.xs, color: Colors.textMuted },
  messagesList: { flex: 1 },
  messagesContent: { padding: Spacing.lg },
  welcomeArea: { alignItems: 'center', paddingVertical: Spacing.xl },
  ziutekVideo: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: Spacing.md },
  welcomeTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.accentCyan,
    marginBottom: 4,
  },
  welcomeDesc: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  suggestions: { marginTop: Spacing.lg, gap: Spacing.sm, width: '100%' },
  suggestionBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
  },
  suggestionText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  msgRow: { flexDirection: 'row', marginBottom: Spacing.md, gap: Spacing.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(34,211,238,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: { maxWidth: '78%', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: 14 },
  bubbleUser: { backgroundColor: Colors.accentPrimary, borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.borderSubtle, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: FontSize.md, lineHeight: 20 },
  textUser: { color: '#fff' },
  textAI: { color: Colors.textSecondary },
  typingBubble: { paddingVertical: Spacing.md },
  typingDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accentCyan },
  inputArea: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    backgroundColor: 'rgba(10,14,26,0.5)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
  },
  input: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(34,211,238,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.accentCyan,
  },
  hint: { textAlign: 'center', fontSize: 10, color: Colors.textMuted, marginTop: Spacing.sm },
});