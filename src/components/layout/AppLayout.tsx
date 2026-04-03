'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';
import RightPanel from './RightPanel';
import BottomNav from './BottomNav';
import DesktopNav from './DesktopNav';
import CallScreen from '@/features/calls/CallScreen';
import { LoginPage, RegisterPage, OnboardingPage, VerifyPage } from '@/features/auth/AuthPages';
import AddContactModal from '@/features/auth/AddContactModal';
import CallsPage from '@/features/calls/CallsPage';
import StoriesPage from '@/features/stories/StoriesPage';
import SettingsPage from '@/features/settings/SettingsPage';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const {
    activeTab,
    activeChatId,
    setActiveChatId,
    showRightPanel,
    isAuthView,
    authView,
    activeCall,
    incomingCall,
    endCall,
    acceptCall,
    rejectCall,
    showAddContact,
  } = useApp();

  // Auth view
  if (isAuthView) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background overflow-hidden">
        <div className="w-full max-w-md h-full md:h-[700px] md:rounded-3xl overflow-hidden border border-border shadow-2xl">
          <AnimatePresence mode="wait">
            {authView === 'login' && <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><LoginPage /></motion.div>}
            {authView === 'register' && <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><RegisterPage /></motion.div>}
            {authView === 'onboarding' && <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><OnboardingPage /></motion.div>}
            {authView === 'verify' && <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><VerifyPage /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Calls overlay */}
      <AnimatePresence>
        {activeCall && (
          <CallScreen call={activeCall} onEnd={endCall} />
        )}
        {incomingCall && !activeCall && (
          <CallScreen call={incomingCall} onEnd={rejectCall} onAccept={acceptCall} onReject={rejectCall} />
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContact && <AddContactModal />}
      </AnimatePresence>

      {/* Desktop Icon Nav */}
      <DesktopNav />

      {/* ─── Mobile Layout ─── */}
      <div className="flex flex-col flex-1 min-w-0 md:hidden">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'chats' && !activeChatId && (
              <motion.div key="chatlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <Sidebar />
              </motion.div>
            )}
            {activeTab === 'chats' && activeChatId && (
              <motion.div key="chatpanel" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="h-full flex flex-col">
                <ChatPanel />
              </motion.div>
            )}
            {activeTab === 'calls' && (
              <motion.div key="calls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
                <CallsPage />
              </motion.div>
            )}
            {activeTab === 'stories' && (
              <motion.div key="stories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <StoriesPage />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <BottomNav />
      </div>

      {/* ─── Desktop Layout ─── */}
      <div className="hidden md:flex flex-1 min-w-0">
        {/* Left panel: Sidebar or alternate tabs */}
        <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col border-r border-border h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'chats' && (
              <motion.div key="sidebar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <Sidebar />
              </motion.div>
            )}
            {activeTab === 'calls' && (
              <motion.div key="calls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                <CallsPage />
              </motion.div>
            )}
            {activeTab === 'stories' && (
              <motion.div key="stories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <StoriesPage />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Middle: Chat Panel */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <ChatPanel />
        </div>

        {/* Right: Info Panel */}
        <AnimatePresence>
          {showRightPanel && activeChatId && (
            <RightPanel key="right-panel" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
