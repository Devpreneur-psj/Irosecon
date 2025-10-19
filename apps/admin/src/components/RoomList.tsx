'use client';

import { ClockIcon, UsersIcon, EyeIcon } from '@heroicons/react/24/outline';

interface AdminRoomView {
  id: string;
  participants: Array<{
    id: string;
    nickname: string;
  }>;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  messageCount: number;
}

interface RoomListProps {
  rooms: AdminRoomView[];
  selectedRoom: string | null;
  onRoomSelect: (roomId: string) => void;
  onRoomEnd: (roomId: string) => void;
}

export default function RoomList({ 
  rooms, 
  selectedRoom, 
  onRoomSelect, 
  onRoomEnd 
}: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-4xl mb-2">💬</div>
        <p>활성 룸이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`cursor-pointer transition-all border rounded-lg p-4 ${
            selectedRoom === room.id
              ? 'ring-2 ring-red-500 bg-red-50'
              : 'hover:shadow-md'
          }`}
          onClick={() => onRoomSelect(room.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 truncate">
                {room.id}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(room.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
            
            <div className="flex space-x-1">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                활성
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <UsersIcon className="h-4 w-4" />
                <span>{room.participants.length}명</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{room.messageCount}개 메시지</span>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRoomEnd(room.id);
              }}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              종료
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
