import { useState, useRef, useCallback, useEffect } from 'react';
import { MessageSquare, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, LogOut } from 'lucide-react';

function SessionItem({ session, isActive, onSelect, onDelete, onRename }) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(session.title);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  const handleRenameStart = (e) => {
    e.stopPropagation();
    setRenameValue(session.title);
    setRenaming(true);
  };

  const handleRenameConfirm = (e) => {
    e.stopPropagation();
    if (renameValue.trim()) {
      onRename(session.session_id, renameValue.trim());
    }
    setRenaming(false);
  };

  const handleRenameCancel = (e) => {
    e.stopPropagation();
    setRenaming(false);
    setRenameValue(session.title);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(session.session_id);
  };

  return (
    <div
      className={`relative group flex items-start gap-2 px-3 py-2.5 rounded-lg mx-1 mb-0.5 cursor-pointer transition-all
        ${isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
          : 'hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent'
        }`}
      onClick={() => !renaming && onSelect(session.session_id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />

      <div className="min-w-0 flex-1">
        {renaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameConfirm(e);
              if (e.key === 'Escape') handleRenameCancel(e);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-xs font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
          />
        ) : (
          <p className={`text-xs font-medium truncate leading-snug transition-colors duration-200 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
            {session.title}
          </p>
        )}
      </div>

      {/* Action icons */}
      <div className={`flex items-center gap-0.5 shrink-0 transition-opacity ${hovered || renaming ? 'opacity-100' : 'opacity-0'}`}>
        {renaming ? (
          <>
            <button
              onClick={handleRenameConfirm}
              className="p-1 rounded text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRenameCancel}
              className="p-1 rounded text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRenameStart}
              className="p-1 rounded text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
              title="Rename"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function Sidebar({
  user,
  onLogout,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  width,
  onWidthChange,
  collapsed,
  onToggleCollapse,
  isMobileOverlay = false,
  onCloseMobile,
  className = '',
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(420, Math.max(180, startWidth.current + delta));
      onWidthChange(newWidth);
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onWidthChange]);

  const containerStyle = isMobileOverlay ? { width: '280px', maxWidth: '85vw' } : { width };

  if (collapsed && !isMobileOverlay) {
    return (
      <aside
        className={`flex flex-col items-center py-4 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-colors duration-200 z-50 ${className}`}
        style={{ width: 52, flexShrink: 0 }}
      >
        <button
          onClick={onNewChat}
          title="New Chat"
          className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition mb-3"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition mt-auto mb-2"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {user && (
          <button
            onClick={onLogout}
            title="Log out"
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside
      className={`${isMobileOverlay ? "fixed top-0 bottom-0 left-0 shadow-2xl z-50" : "relative"} flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200 shrink-0 ${className}`}
      style={containerStyle}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200 dark:border-slate-700">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chats</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            title="New Chat"
            className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          {isMobileOverlay ? (
            <button
              onClick={onCloseMobile}
              title="Close sidebar"
              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-gray-400 text-xs">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
            No previous chats
          </div>
        ) : (
          <>
            {sessions.slice(0, visibleCount).map((session, i, arr) => (
              <div key={session.session_id}>
                <SessionItem
                  session={session}
                  isActive={activeSessionId === session.session_id}
                  onSelect={onSelectSession}
                  onDelete={onDeleteSession}
                  onRename={onRenameSession}
                />
                {i < arr.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-800 to-transparent mx-4 opacity-70" />
                )}
              </div>
            ))}
            {sessions.length > visibleCount && (
              <div className="px-3 py-2 mt-1">
                <button
                  onClick={() => setVisibleCount((c) => c + 10)}
                  className="w-full py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Load More ({sessions.length - visibleCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Profile Footer */}
      {user && (
        <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.id}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Resize Handle */}
      {!isMobileOverlay && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-transparent"
          title="Drag to resize"
        />
      )}
    </aside>
  );
}
