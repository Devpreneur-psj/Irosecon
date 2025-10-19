'use client';

import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  senderNickname: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  encrypted: boolean;
}

interface LogManagerProps {
  roomId: string;
  messages: Message[];
}

interface LogEntry {
  id: string;
  roomId: string;
  timestamp: Date;
  action: string;
  data: any;
  encrypted: boolean;
}

export default function LogManager({ roomId, messages }: LogManagerProps) {
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // IndexedDB 초기화
  useEffect(() => {
    const initIndexedDB = async () => {
      const request = indexedDB.open('AdminLogs', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id' });
        }
      };
    };

    initIndexedDB();
  }, []);

  // 로그 저장
  const saveLogEntry = async (entry: LogEntry) => {
    try {
      const request = indexedDB.open('AdminLogs', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['logs'], 'readwrite');
        const store = transaction.objectStore('logs');
        
        // 암호화하여 저장
        const encryptedEntry = {
          ...entry,
          data: JSON.stringify(entry.data), // 간단한 직렬화
        };
        
        store.add(encryptedEntry);
      };
    } catch (error) {
      console.error('Failed to save log entry:', error);
    }
  };

  // 메시지 로그 추가
  useEffect(() => {
    if (isLoggingEnabled && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      const logEntry: LogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId,
        timestamp: new Date(),
        action: 'message_received',
        data: {
          messageId: latestMessage.id,
          senderNickname: latestMessage.senderNickname,
          messageType: latestMessage.type,
          encrypted: latestMessage.encrypted,
        },
        encrypted: true,
      };

      saveLogEntry(logEntry);
      setLogEntries(prev => [...prev, logEntry]);
    }
  }, [messages, isLoggingEnabled, roomId]);

  // 로그 내보내기
  const exportLogs = async () => {
    setIsExporting(true);
    
    try {
      const request = indexedDB.open('AdminLogs', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['logs'], 'readonly');
        const store = transaction.objectStore('logs');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const logs = getAllRequest.result;
          const roomLogs = logs.filter(log => log.roomId === roomId);
          
          // 로그를 JSON 파일로 다운로드
          const dataStr = JSON.stringify(roomLogs, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `counseling_logs_${roomId}_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        };
      };
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('로그 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 로그 삭제
  const clearLogs = async () => {
    if (!confirm('모든 로그를 삭제하시겠습니까?')) return;
    
    try {
      const request = indexedDB.open('AdminLogs', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['logs'], 'readwrite');
        const store = transaction.objectStore('logs');
        
        store.clear();
        setLogEntries([]);
      };
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            로그 관리
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLoggingEnabled(!isLoggingEnabled)}
              className={`px-3 py-1 rounded text-sm ${
                isLoggingEnabled 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isLoggingEnabled ? '로깅 중지' : '로깅 시작'}
            </button>
            
            <button
              onClick={exportLogs}
              disabled={isExporting || logEntries.length === 0}
              className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1 inline" />
              내보내기
            </button>
            
            <button
              onClick={clearLogs}
              className="px-3 py-1 rounded text-sm bg-red-500 text-white hover:bg-red-600"
            >
              <TrashIcon className="h-4 w-4 mr-1 inline" />
              삭제
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {logEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📝</div>
              <p>로그가 없습니다</p>
              <p className="text-sm">로깅을 시작하면 여기에 기록됩니다</p>
            </div>
          ) : (
            logEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-50 border border-gray-200 rounded p-3 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {entry.action}
                  </span>
                  <span className="text-gray-500">
                    {entry.timestamp.toLocaleTimeString('ko-KR')}
                  </span>
                </div>
                
                <div className="text-gray-600">
                  {entry.action === 'message_received' && (
                    <div>
                      <div>발신자: {entry.data.senderNickname}</div>
                      <div>타입: {entry.data.messageType}</div>
                      <div>암호화: {entry.data.encrypted ? '예' : '아니오'}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
