'use client';

import { AdminRoomView } from '@/types';
import { Card, CardContent, Badge, Button } from '@/ui';
import { formatTime } from '@/ui/utils';
import { ClockIcon, UsersIcon, EyeIcon } from '@heroicons/react/24/outline';

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
        <Card
          key={room.roomId}
          className={`cursor-pointer transition-all ${
            selectedRoom === room.roomId
              ? 'ring-2 ring-red-500 bg-red-50'
              : 'hover:shadow-md'
          }`}
          onClick={() => onRoomSelect(room.roomId)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {room.roomId}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(room.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              
              <div className="flex space-x-1">
                {room.supervisorConsent && (
                  <Badge variant="warning" className="text-xs">
                    감독
                  </Badge>
                )}
                <Badge variant="success" className="text-xs">
                  활성
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{room.participants}명</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatTime(room.timeRemaining)}</span>
                </div>
              </div>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onRoomEnd(room.roomId);
                }}
                variant="danger"
                size="sm"
                className="text-xs"
              >
                종료
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
