import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상담센터 - 익명 상담 서비스',
  description: '안전하고 익명의 상담 서비스를 제공합니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
