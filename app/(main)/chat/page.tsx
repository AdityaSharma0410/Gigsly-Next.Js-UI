'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { chatApi, userApi, type ChatThread, type Message, type User } from '@/lib/api';
import type { AxiosError } from 'axios';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

export default function ChatPage() {
  useRequireAuth();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const isNearBottomRef = useRef(true);
  const forceScrollRef = useRef(false);
  const forceTopRef = useRef(false);

  useEffect(() => {
    if (user) {
      loadThreads();
      connectWebSocket();
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      loadOtherUser();
      // When switching threads, start at TOP by default.
      forceTopRef.current = true;
    }
  }, [selectedThread]);

  useEffect(() => {
    if (!selectedThread) return;
    // Poll only when realtime isn't connected.
    if (wsConnected) return;
    const timer = window.setInterval(() => {
      loadMessages(selectedThread.id);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [selectedThread?.id, wsConnected]);

  useEffect(() => {
    if (forceTopRef.current) {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = 0;
      forceTopRef.current = false;
      return;
    }

    // Only autoscroll if user is already near the bottom, or when we explicitly force it
    // (e.g. after sending a message).
    if (forceScrollRef.current || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: forceScrollRef.current ? 'auto' : 'smooth' });
      forceScrollRef.current = false;
    }
  }, [messages]);

  const connectWebSocket = () => {
    // WebSocket is served by chat-service (not the API gateway)
    const base = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8088';
    const httpUrl = base.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
    const token = Cookies.get('auth_token');
    const qp = token ? `?token=${encodeURIComponent(token)}` : '';
    const socket = new SockJS(`${httpUrl.replace(/\/$/, '')}/ws${qp}`);
    
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      setWsConnected(true);
      if (user) {
        stompClient.subscribe('/user/queue/messages', (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            if (selectedThread && newMessage.threadId !== selectedThread.id) return prev;
            return [...prev, newMessage];
          });
          loadThreads();
        });
      }
    };
    stompClient.onStompError = () => setWsConnected(false);
    stompClient.onWebSocketError = () => setWsConnected(false);
    stompClient.onDisconnect = () => setWsConnected(false);

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  const loadThreads = async () => {
    try {
      const data = await chatApi.getThreads();
      setThreads(data);
      const threadIdFromUrl = Number(searchParams.get('threadId'));
      if (threadIdFromUrl) {
        const found = data.find((t) => t.id === threadIdFromUrl);
        if (found) {
          setSelectedThread(found);
          return;
        }
      }
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (error) {
      const ax = error as AxiosError;
      console.error('Failed to load threads', ax.response?.status, ax.response?.data ?? ax.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: number) => {
    try {
      const list = await chatApi.getMessages(threadId);
      setMessages(list);
      await chatApi.markThreadRead(threadId).catch(() => undefined);
      // Keep thread list fresh, but avoid hammering backend on every message refresh.
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
      );
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const loadOtherUser = async () => {
    if (!selectedThread || !user) return;
    const otherUserId = selectedThread.user1Id === user.id 
      ? selectedThread.user2Id 
      : selectedThread.user1Id;
    try {
      const userData = await userApi.getProfile(otherUserId);
      setOtherUser(userData);
    } catch (error) {
      console.error('Failed to load user', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedThread || !user) return;

    setSending(true);
    try {
      await chatApi.sendMessage({
        threadId: selectedThread.id,
        content: messageText,
        messageType: 'TEXT',
      });
      forceScrollRef.current = true;
      await loadMessages(selectedThread.id);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 h-[calc(100vh-10rem)]">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {wsConnected ? 'Realtime connected' : 'Realtime reconnecting (polling enabled)'}
        </p>

        <div className="grid lg:grid-cols-3 gap-6 h-full">
          {/* Thread List */}
          <div className="lg:col-span-1 border border-border rounded-xl bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {threads.length === 0 ? (
                <div className="text-center py-20">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-4 text-left border-b border-border hover:bg-muted transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        U
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">User {thread.user1Id === user?.id ? thread.user2Id : thread.user1Id}</p>
                        {(thread.lastMessageText || thread.lastMessage) && (
                          <p className="text-sm text-muted-foreground truncate">
                            {thread.lastMessageText || thread.lastMessage}
                          </p>
                        )}
                      </div>
                      {(thread.unreadCount ?? 0) > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden flex flex-col">
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {otherUser?.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{otherUser?.fullName || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{otherUser?.role || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  onScroll={() => {
                    const el = messagesContainerRef.current;
                    if (!el) return;
                    const threshold = 120;
                    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
                    isNearBottomRef.current = distanceFromBottom <= threshold;
                  }}
                >
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-xl ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-muted-foreground'}`}>
                            {new Date(message.createdAt || message.sentAt || '').toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-3 rounded-lg border border-border bg-background"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="px-6 py-3 rounded-lg gradient-hero text-white font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
