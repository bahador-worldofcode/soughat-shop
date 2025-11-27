'use client';

import { useEffect, useState, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { encodeURL } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/lib/store';
import { Loader2, CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CryptoPayment() {
  const { totalPrice } = useStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 1. تنظیمات دریافت کننده (Merchant)
  const recipient = useMemo(() => new PublicKey('Gv36h8j2q3Qz8Jk9G7r1r9y8h3Qz8Jk9G7r1r9y8h3Qz'), []);

  // 2. اطلاعات تراکنش
  const amount = useMemo(() => new BigNumber(totalPrice()), [totalPrice]);
  const reference = useMemo(() => new PublicKey(PublicKey.default), []); 
  const label = 'Soughat Shop';
  const message = 'Gift Order Payment';

  // 3. ساخت URL
  const url = useMemo(() => encodeURL({
    recipient,
    amount,
    reference,
    label,
    message,
  }), [recipient, amount, reference]);

  const handleCopy = () => {
    navigator.clipboard.writeText(recipient.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // شبیه‌سازی بررسی تراکنش و انتقال به صفحه موفقیت
  const handleCheckPayment = () => {
    setIsChecking(true);
    // اینجا در آینده به بلاک‌چین وصل می‌شویم تا تراکنش واقعی را پیدا کنیم
    // فعلاً ۳ ثانیه صبر می‌کنیم تا حس واقعی بدهد
    setTimeout(() => {
      router.push('/success');
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-lg animate-in fade-in zoom-in duration-300">
      
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold text-gray-900">پرداخت با Solana / USDT</h3>
        <p className="text-sm text-gray-500 mt-1">
          شبکه Solana (کارمزد زیر $0.01)
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-inner mb-6 relative group">
        <QRCodeSVG 
          value={url.toString()} 
          size={200}
          level="H"
          className="rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-1 rounded-full shadow-md">
             <div className="w-8 h-8 bg-gradient-to-tr from-[#9945FF] to-[#14F195] rounded-full" />
          </div>
        </div>
      </div>

      {/* اطلاعات */}
      <div className="w-full space-y-4 mb-8">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">مبلغ نهایی:</span>
          <span className="text-xl font-bold text-gray-900">{amount.toString()} SOL</span>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center justify-between w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
          >
            <span className="text-xs font-mono text-blue-800 truncate px-1">
              {recipient.toBase58().slice(0, 20)}...
            </span>
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-blue-400 group-hover:text-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* دکمه بررسی وضعیت */}
      <button
        onClick={handleCheckPayment}
        disabled={isChecking}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
      >
        {isChecking ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>در حال بررسی بلاک‌چین...</span>
          </>
        ) : (
          <>
            <span>من پرداخت کردم</span>
            <ArrowLeft className="h-5 w-5" />
          </>
        )}
      </button>
      
      <p className="mt-4 text-center text-xs text-gray-400">
        بعد از ارسال ارز، دکمه بالا را بزنید.
      </p>

    </div>
  );
}