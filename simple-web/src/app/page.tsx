export default function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 상담센터 플랫폼</h1>
      <p>안전하고 익명의 상담 서비스를 제공합니다.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>📱 서비스</h2>
        <ul>
          <li>익명 상담</li>
          <li>실시간 채팅</li>
          <li>파일 공유</li>
          <li>15분 세션</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>🔐 보안 특징</h2>
        <ul>
          <li>엔드투엔드 암호화</li>
          <li>자동 데이터 삭제</li>
          <li>감독 모드</li>
          <li>개인정보 보호</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => alert('상담 시작 기능은 개발 중입니다!')}
        >
          상담 시작하기
        </button>
      </div>
    </div>
  );
}
