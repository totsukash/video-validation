"use client"

import { useRef, useState } from "react";

export default function Home() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAudioDetected, setIsAudioDetected] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAudioInVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');

      video.onloadeddata = () => {
        const audioTrack = video.captureStream().getAudioTracks()[0];
        if (audioTrack) {
          resolve(true);
        } else {
          // フォールバック: 音声トラックが取得できない場合は他の方法を試す
          if (video.mozHasAudio !== undefined) {
            resolve(video.mozHasAudio);
          } else if (video.webkitAudioDecodedByteCount !== undefined) {
            resolve(video.webkitAudioDecodedByteCount > 0);
          } else {
            // どの方法でも判定できない場合
            reject(new Error('音声の検出方法が利用できません。'));
          }
        }
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        reject(new Error('動画ファイルの読み込みに失敗しました。'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      setIsAudioDetected(null);

      try {
        const hasAudio = await checkAudioInVideo(file);
        setIsAudioDetected(hasAudio);
        if (!hasAudio) {
          setErrorMessage('選択された動画には音声が含まれていません。');
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(`動画のチェック中にエラーが発生しました: ${error.message}`);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p
          className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          動画をアップロードして音声をチェック
        </p>
      </div>

      <div className="relative flex place-items-center">
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={handleUploadClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            動画を選択
          </button>
          {selectedFile && (
            <p className="mt-2 text-sm">選択されたファイル: {selectedFile.name}</p>
          )}
          {errorMessage && (
            <p className="mt-2 text-red-500">{errorMessage}</p>
          )}
          {isAudioDetected === true && (
            <p className="mt-2 text-green-500">選択された動画には音声が含まれています。</p>
          )}
          {isAudioDetected === false && (
            <p className="mt-2 text-red-500">選択された動画には音声が含まれていません。</p>
          )}
        </div>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        {/* 既存のリンクセクションはそのまま保持 */}
      </div>
    </main>
  );
}