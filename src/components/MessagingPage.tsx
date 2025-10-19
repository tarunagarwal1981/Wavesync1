import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import { MessageSquare, Send, Paperclip, Search, Circle, Plus, X } from 'lucide-react';
import styles from './MessagingPage.module.css';

interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_type: string;
  last_message_text: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
  is_other_user_online: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  attachment_url: string | null;
  attachment_filename: string | null;
  created_at: string;
  read_at: string | null;
  status: 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: string;
  full_name: string;
  user_type: string;
  company_name?: string;
}

export const MessagingPage: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();

    // Poll for conversation updates every 5 seconds (works without Realtime)
    const conversationsInterval = setInterval(() => {
      fetchConversations();
    }, 5000);

    // Update online status
    updateOnlineStatus(true);

    // Cleanup
    return () => {
      clearInterval(conversationsInterval);
      updateOnlineStatus(false);
    };
  }, []);

  // Subscribe to messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.conversation_id);
    markAsRead(selectedConversation.conversation_id);

    // Poll for new messages every 3 seconds (works without Realtime)
    const messagesInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation.conversation_id)
          .order('created_at', { ascending: true });

        if (!error && data) {
          // Only update if message count changed
          if (data.length !== messages.length) {
            setMessages(data);
            
            // Check if last message is from other user
            const lastMsg = data[data.length - 1];
            if (lastMsg?.sender_id !== profile?.id) {
              markAsRead(selectedConversation.conversation_id);
            }
            
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);

    return () => {
      clearInterval(messagesInterval);
    };
  }, [selectedConversation, messages.length, profile?.id]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_conversations');

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !profile) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.conversation_id,
          sender_id: profile.id,
          message_text: newMessage.trim(),
          status: 'sent'
        });

      if (error) throw error;

      setNewMessage('');
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      addToast({
        type: 'error',
        title: 'Failed to send message',
        description: 'Please try again',
        duration: 3000
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId
      });
      
      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      await supabase.rpc('update_online_status', {
        p_is_online: isOnline
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const fetchContacts = async () => {
    if (!profile) return;
    
    try {
      setLoadingContacts(true);
      
      // Get contacts based on user type
      let query = supabase
        .from('user_profiles')
        .select('id, full_name, user_type');
      
      if (profile.user_type === 'seafarer') {
        // Seafarers can message company users from their company
        query = query
          .eq('company_id', profile.company_id)
          .in('user_type', ['company', 'admin']);
      } else if (profile.user_type === 'company' || profile.user_type === 'admin') {
        // Company users can message seafarers from their company
        query = query
          .eq('company_id', profile.company_id)
          .eq('user_type', 'seafarer');
      }
      
      const { data, error } = await query
        .neq('id', profile.id) // Exclude self
        .order('full_name');
      
      if (error) throw error;
      
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      addToast({
        type: 'error',
        title: 'Failed to load contacts',
        description: 'Please try again',
        duration: 3000
      });
    } finally {
      setLoadingContacts(false);
    }
  };

  const startConversation = async (contactId: string) => {
    try {
      // Get or create conversation
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        p_other_user_id: contactId
      });

      if (error) throw error;

      // Refresh conversations to include the new one
      await fetchConversations();

      // Find and select the new conversation
      const newConv = conversations.find(c => c.conversation_id === conversationId);
      if (newConv) {
        setSelectedConversation(newConv);
      } else {
        // If not in the list yet, refetch after a short delay
        setTimeout(async () => {
          await fetchConversations();
          const conv = conversations.find(c => c.conversation_id === conversationId);
          if (conv) setSelectedConversation(conv);
        }, 500);
      }

      setShowNewConversationModal(false);
      setContactSearchQuery('');

      addToast({
        type: 'success',
        title: 'Conversation started',
        description: 'You can now send messages',
        duration: 3000
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      addToast({
        type: 'error',
        title: 'Failed to start conversation',
        description: 'Please try again',
        duration: 3000
      });
    }
  };

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    contact.full_name.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <div className={styles.container}>
      {/* Sidebar - Conversations List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitleRow}>
            <h2 className={styles.sidebarTitle}>
              <MessageSquare size={24} />
              Messages
              {totalUnread > 0 && (
                <span className={styles.totalUnreadBadge}>{totalUnread}</span>
              )}
            </h2>
            <button
              className={styles.newConversationBtn}
              onClick={() => {
                setShowNewConversationModal(true);
                fetchContacts();
              }}
              title="Start new conversation"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.conversationsList}>
          {loading ? (
            <div className={styles.loading}>Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={48} />
              <p>No conversations yet</p>
              <span>Start a conversation with a crew member</span>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className={`${styles.conversationItem} ${
                  selectedConversation?.conversation_id === conv.conversation_id
                    ? styles.conversationItemActive
                    : ''
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className={styles.conversationAvatar}>
                  <div className={styles.avatarCircle}>
                    {conv.other_user_name.charAt(0).toUpperCase()}
                  </div>
                  {conv.is_other_user_online && (
                    <Circle className={styles.onlineIndicator} size={12} fill="#10b981" />
                  )}
                </div>
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationHeader}>
                    <span className={styles.userName}>{conv.other_user_name}</span>
                    {conv.last_message_at && (
                      <span className={styles.messageTime}>
                        {new Date(conv.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <div className={styles.conversationPreview}>
                    <span className={styles.userType}>{conv.other_user_type}</span>
                    {conv.last_message_text && (
                      <span className={styles.lastMessage}>
                        {conv.last_message_sender_id === profile?.id && 'You: '}
                        {conv.last_message_text}
                      </span>
                    )}
                  </div>
                </div>
                {conv.unread_count > 0 && (
                  <div className={styles.unreadBadge}>{conv.unread_count}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <div className={styles.headerAvatar}>
                  {selectedConversation.other_user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={styles.chatUserName}>
                    {selectedConversation.other_user_name}
                  </h3>
                  <p className={styles.chatUserStatus}>
                    {selectedConversation.is_other_user_online ? (
                      <>
                        <Circle size={8} fill="#10b981" style={{ display: 'inline' }} />
                        {' '}Online
                      </>
                    ) : (
                      'Offline'
                    )}
                    {' • '}
                    <span className={styles.userTypeLabel}>
                      {selectedConversation.other_user_type}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer} id="messages-container">
              {messages.map((message) => {
                const isOwn = message.sender_id === profile?.id;
                return (
                  <div
                    key={message.id}
                    className={`${styles.messageWrapper} ${
                      isOwn ? styles.messageWrapperOwn : styles.messageWrapperOther
                    }`}
                  >
                    <div
                      className={`${styles.messageBubble} ${
                        isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther
                      }`}
                    >
                      <p className={styles.messageText}>{message.message_text}</p>
                      <span className={styles.messageTimestamp}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {isOwn && message.read_at && ' • Read'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className={styles.messageInputContainer}>
              <button className={styles.attachButton} title="Attach file">
                <Paperclip size={20} />
              </button>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className={styles.messageInput}
                rows={1}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className={styles.sendButton}
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyChat}>
            <MessageSquare size={64} />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className={styles.modalOverlay} onClick={() => setShowNewConversationModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Start New Conversation</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowNewConversationModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.searchBox}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.contactsList}>
                {loadingContacts ? (
                  <div className={styles.loading}>Loading contacts...</div>
                ) : filteredContacts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No contacts found</p>
                    <span>
                      {profile?.user_type === 'seafarer'
                        ? 'No company users available to message'
                        : 'No seafarers available in your company'}
                    </span>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={styles.contactItem}
                      onClick={() => startConversation(contact.id)}
                    >
                      <div className={styles.contactAvatar}>
                        {contact.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.contactInfo}>
                        <span className={styles.contactName}>{contact.full_name}</span>
                        <span className={styles.contactType}>
                          {contact.user_type === 'company' ? 'Company User' : 
                           contact.user_type === 'admin' ? 'Administrator' : 'Seafarer'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;

