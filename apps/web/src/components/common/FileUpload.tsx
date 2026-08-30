import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paperclip } from 'lucide-react';
import axios from 'axios'; // 因为需要进度条， 回退到直接使用axios,原生的 fetch API 目前还不支持监听上传进度（Upload Progress）

// 保持和 http.ts 一致的 Base URL 逻辑
const API_BASE_URI = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface AttachmentType {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

interface FileUploadProps {
  onUploadSuccess: (attachment: AttachmentType) => void;
  context?: 'chat' | 'avatar';
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, context = 'chat' }) => {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t('fileUpload.sizeLimit', 'File size cannot exceed 5MB!'));
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);

    try {
      // 提取队友的 Token 获取逻辑，保证认证通过
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(`${API_BASE_URI}/files/upload?context=${context}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      
      onUploadSuccess(response.data.data);
    } catch (error: any) {
      // 从 axios 的 error 对象中提取状态码和后端返回的具体信息
      const status = error.response?.status;
      const backendMessage = error.response?.data?.message; 

      if (status === 401) {
        // 处理鉴权失败的情况，和队友的拦截器保持一致
        localStorage.removeItem('access_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        // 401 一般直接跳转，不需要弹窗
      } 
      // 根据状态码或后端的 Error Code 进行精准翻译
      else if (status === 403 || backendMessage === 'PERMISSION_DENIED') {
        alert(t('errors.noPermission', 'You do not have permission to perform this action.'));
      } 
      else if (status === 404 || backendMessage === 'FILE_NOT_FOUND') {
        alert(t('errors.fileNotFound', 'File not found or already deleted.'));
      } 
      else if (status === 413) {
        // Multer 如果校验文件太大，默认会返回 413 Payload Too Large
        alert(t('fileUpload.sizeLimit', 'File size cannot exceed 5MB!'));
      }
      else if (status === 400 || backendMessage === 'UNSUPPORTED_FILE_TYPE') {
        // 精准捕获文件类型不支持的错误
        alert(t('errors.unsupportedFileType', 'Unsupported file type.'));
      }
      else {
        // 通用兜底错误
        alert(t('fileUpload.uploadFailed', 'Upload failed, please try again.'));
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      <input
        type="file"
        id="chat-file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*, application/pdf, .zip"
        disabled={isUploading}
      />
      <label 
        htmlFor="chat-file-upload" 
        className={`cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : 'text-gray-500 hover:text-blue-600'}`}
      >
        <Paperclip size={20} />
      </label>

      {/* 悬浮进度条提示 */}
      {isUploading && (
        <div className="absolute bottom-full left-0 mb-2 w-32 bg-white border shadow-lg rounded-md p-2 z-10 text-xs">
          <div className="flex justify-between mb-1">
            <span>{t('fileUpload.uploading', 'Uploading')}...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};