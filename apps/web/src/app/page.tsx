'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardContent } from '@/ui';
import { isValidNickname } from '@/ui/utils';

export default function HomePage() {
  const [nickname, setNickname] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleStartCounseling = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!isValidNickname(nickname)) {
      setError('닉네임은 2-20자, 한글/영문/숫자만 사용 가능합니다.');
      return;
    }

    if (!consent) {
      setError('개인정보 처리방침 및 이용약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 룸 ID 생성
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 세션 스토리지에 사용자 정보 저장
      sessionStorage.setItem('userInfo', JSON.stringify({
        nickname: nickname.trim(),
        consent,
        roomId,
      }));

      // 채팅 페이지로 이동
      router.push(`/chat/${roomId}`);
    } catch (err) {
      setError('상담을 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            익명 상담 시작
          </h1>
          <p className="text-gray-600">
            안전하고 익명의 상담 서비스를 제공합니다
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <Input
              label="닉네임"
              placeholder="닉네임을 입력하세요 (2-20자)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              error={error && !consent ? error : ''}
              maxLength={20}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                <span className="font-medium">개인정보 처리방침</span> 및{' '}
                <span className="font-medium">이용약관</span>에 동의합니다.
                <br />
                <span className="text-gray-500 text-xs">
                  본 대화는 품질 향상 및 안전 확보를 위해 감독될 수 있습니다.
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleStartCounseling}
            loading={loading}
            disabled={!nickname.trim() || !consent}
            className="w-full"
          >
            상담 시작하기
          </Button>

          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>• 세션은 15분간 유지됩니다</p>
            <p>• 연장하기 버튼으로 시간을 연장할 수 있습니다</p>
            <p>• 세션 종료 시 모든 대화 내용이 즉시 삭제됩니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
