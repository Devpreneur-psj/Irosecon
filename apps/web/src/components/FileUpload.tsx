'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/ui';
import { PaperClipIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { formatFileSize, isValidFileType } from '@/ui/utils';

interface FileUploadProps {
  roomId: string;
  onFileUpload: (fileInfo: any) => void;
}

export default function FileUpload({ roomId, onFileUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 파일 타입 검증
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!isValidFileType(file, allowedTypes)) {
      alert('지원하지 않는 파일 형식입니다.');
      return;
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. 서버에서 업로드 URL 요청
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileId } = await response.json();

      // 2. 파일을 S3에 직접 업로드
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // 3. 파일 정보를 채팅에 전송
      const fileInfo = {
        id: fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        url: uploadUrl.split('?')[0], // 쿼리 파라미터 제거
      };

      onFileUpload(fileInfo);
      setUploadProgress(100);

    } catch (error) {
      console.error('File upload error:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [roomId, onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    }
    return <DocumentIcon className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">업로드 중... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <PaperClipIcon className="h-6 w-6 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? '파일을 여기에 놓으세요'
                : '파일을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-xs text-gray-500">
              이미지, PDF, 텍스트 파일 (최대 10MB)
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
