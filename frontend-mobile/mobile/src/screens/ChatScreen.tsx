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

const AI_RESPONSES = [
  `Based on current weather conditions, wind farms are operating at approximately 72% efficiency. The strongest output is in the Pomerania region.`,
  `Poland's total installed capacity across all tracked facilities is approximately 24,000 MW. Coal still represents the largest share at ~60%.`,
  `The Silesian voivodeship has the highest energy consumption due to its industrial base, with current load factors averaging 78%.`,
  `Solar parks are performing well today with sunshine index at 0.65. The Witnica Solar Park in Lubuskie is producing 52 MW.`,
  `Energy storage facilities are currently at 89% charge capacity. The Żarnowiec Battery Storage leads with 200 MW available.`,
  `Comparing wind vs solar: wind farms average 74% efficiency today due to moderate winds, while solar parks average 68% under partial cloud cover.`,
];

const SUGGESTIONS = [
  "What's the total energy capacity?",
  'Compare wind vs solar output',
  'Which province uses the most energy?',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ziutekPhase, setZiutekPhase] = useState<'idle' | 'output2' | 'hidden'>('idle');
  const flatRef = useRef<FlatList>(null);

  const hasResponses = messages.some(m => m.role === 'assistant');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: response };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
      if (ziutekPhase === 'idle') setZiutekPhase('output2');
      else if (ziutekPhase === 'hidden') setZiutekPhase('output2');
    }, 2000 + Math.random() * 1500);
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
            {/* Ziutek video */}
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
