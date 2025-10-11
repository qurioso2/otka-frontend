'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Link2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  compact?: boolean;
}

export default function ShareButtons({ url, title, description, compact = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fullUrl = url.startsWith('http') ? url : `https://otka.ro${url}`;
  const shareText = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Link copiat în clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Eroare la copierea link-ului');
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${fullUrl}`)}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  // Compact version for product cards
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
          title="Share"
          data-testid="share-button-compact"
        >
          <Share2 size={18} />
        </button>

        {showMenu && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Share menu */}
            <div className="absolute right-0 top-full mt-2 bg-white border-2 border-neutral-200 rounded-xl shadow-2xl p-2 min-w-[200px]" style={{ zIndex: 9999 }}>
              <div className="text-xs font-bold text-neutral-700 mb-2 px-2">
                Share pe:
              </div>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-blue-50 rounded-lg transition"
              >
                <Facebook size={16} className="text-blue-600" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-green-50 rounded-lg transition"
              >
                <MessageCircle size={16} className="text-green-600" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-sky-50 rounded-lg transition"
              >
                <Twitter size={16} className="text-sky-600" />
                Twitter / X
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-blue-50 rounded-lg transition"
              >
                <Linkedin size={16} className="text-blue-700" />
                LinkedIn
              </button>
              <div className="border-t border-neutral-200 my-2" />
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    Link copiat!
                  </>
                ) : (
                  <>
                    <Link2 size={16} className="text-neutral-600" />
                    Copiază link
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full version for product detail page
  return (
    <div className="space-y-3" data-testid="share-buttons-full">
      <h3 className="text-sm font-bold text-neutral-900">Share produs:</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          title="Share pe Facebook"
        >
          <Facebook size={16} />
          Facebook
        </button>

        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
          title="Share pe WhatsApp"
        >
          <MessageCircle size={16} />
          WhatsApp
        </button>

        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium text-sm"
          title="Share pe Twitter/X"
        >
          <Twitter size={16} />
          Twitter
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-medium text-sm"
          title="Share pe LinkedIn"
        >
          <Linkedin size={16} />
          LinkedIn
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition font-medium text-sm"
          title="Copiază link"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-600" />
              Copiat!
            </>
          ) : (
            <>
              <Link2 size={16} />
              Copiază link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
