import { Clock, Film, User, MapPin, Tag, Hash, Building, Monitor, FileText } from 'lucide-react';
import { VideoProbeDetailVo } from '@/lib/bindings/VideoProbeDetailVo';
import { useState } from 'react';
import { getAssetUrl } from '@/utils/music';

type VideoProbeCardProps = {
  video: VideoProbeDetailVo;
};

export const VideoProbeCard = ({ video }: VideoProbeCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlay, setIsPlay] = useState(false);

  const getResolution = (width: number, height: number) => {
    if (width >= 3840 && height >= 2160) return '4K';
    if (width >= 1920 && height >= 1080) return '1080p';
    if (width >= 1280 && height >= 720) return '720p';
    return `${width}x${height}`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 76)
      return {
        from: 'from-emerald-500',
        via: 'via-cyan-500',
        to: 'to-teal-500',
        glow: 'shadow-emerald-500/50',
      };
    if (rating >= 51)
      return {
        from: 'from-yellow-500',
        via: 'via-orange-500',
        to: 'to-amber-500',
        glow: 'shadow-yellow-500/50',
      };
    return {
      from: 'from-red-500',
      via: 'from-rose-500',
      to: 'to-pink-500',
      glow: 'shadow-red-500/50',
    };
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden  mx-auto relative group">
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>

      {/* Main card with glassmorphism */}
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 overflow-hidden">
          {video.base64Cover ? (
            <>
              {/* 1. 缩略图（正常显示） */}
              <img
                onClick={() => setIsHovering(true)}
                src={video.base64Cover}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* 2. 悬停原图层（仅在有图时出现） */}
              <div
                className="absolute inset-0 flex items-center justify-center
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-300 pointer-events-none">
                {/* 玻璃罩 */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                {/* 原图卡片 */}
                <div
                  className="relative max-w-[90%] max-h-[90%]
                        rounded-xl overflow-hidden
                        shadow-2xl shadow-black/60
                        border border-white/10">
                  <img src={video.base64Cover} alt={video.title} className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </>
          ) : (
            /* 3. 无图占位保持原样 */
            <div className="w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_70%)]"></div>
              <div className="relative z-10 flex flex-col items-center">
                <Film className="w-16 h-16 text-cyan-400/60" />
                <span className="text-cyan-400/40 text-sm mt-2">No Preview</span>
              </div>
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-cyan-400 px-2.5 py-1.5 rounded-lg text-sm font-mono border border-cyan-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration.toDuration()}
          </div>

          {/* Resolution badge */}
          <div
            onClick={() => setIsPlay(true)}
            className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-purple-400 px-2.5 py-1.5 rounded-lg text-sm font-mono border border-purple-500/30 flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            {getResolution(video.width, video.height)}
          </div>

          {/* Scan line effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title with Rating Badge */}
          <div className="flex items-start gap-3 mb-2">
            {video.rating && (
              <div
                className={`relative w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br ${getRatingColor(parseInt(video.rating)).from} ${getRatingColor(parseInt(video.rating)).via} ${getRatingColor(parseInt(video.rating)).to} flex items-center justify-center shadow-lg ${getRatingColor(parseInt(video.rating)).glow} hover:scale-110 transition-transform duration-200`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="relative text-white text-sm font-bold font-mono">{video.rating}</span>
              </div>
            )}
            <h3 className="text-xl font-bold text-white line-clamp-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex-1">
              {video.title}
            </h3>
          </div>

          {/* Subtitle */}
          {video.subtitle && <p className="text-gray-400 text-sm mb-4 italic font-light">{video.subtitle}</p>}

          {/* File Size */}
          {video.size !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">
                <span className="font-medium text-blue-300">Size:</span> {video.size.toFileSize()}
              </span>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="space-y-3">
            {/* Performers */}
            {video.performers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">PERFORMERS</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {video.performers.map((performer, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 text-cyan-300 text-xs px-2 py-1 rounded-md font-mono border border-cyan-700/30 hover:border-cyan-600/50 transition-colors duration-200">
                      {performer}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Studio */}
            {video.studio && (
              <div className="flex items-start gap-2">
                <Building className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="text-purple-400 font-mono uppercase tracking-wider">STUDIO</span>
                  <div className="text-gray-300 ml-1">{video.studio}</div>
                </div>
              </div>
            )}

            {/* Code */}
            {video.code && (
              <div className="flex items-start gap-2">
                <Hash className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="text-green-400 font-mono uppercase tracking-wider">CODE</span>
                  <div className="text-gray-300 ml-1">{video.code}</div>
                </div>
              </div>
            )}

            {/* Country */}
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-amber-400 font-mono uppercase tracking-wider">COUNTRY</span>
                <div className="text-gray-300 ml-1">{video.country}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">TAGS</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {video.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 text-pink-300 text-xs px-2 py-1 rounded-md font-mono border border-pink-700/20 hover:border-pink-600/40 transition-colors duration-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical specs footer */}
          <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3 h-3 text-gray-500" />
              <span className="font-mono">
                {video.width}×{video.height}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="font-mono">{video.duration.toDuration()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-size hover image modal - centered and much better positioned */}
      {isHovering && video.base64Cover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsHovering(false)} />

          {/* Image container */}
          <div className="relative max-w-[95vw] max-h-[95vh] rounded-xl overflow-hidden shadow-2xl border border-white/20">
            <img src={video.base64Cover} alt={video.title} className="max-w-full max-h-full object-contain" />
            {/* Close indicator */}
            <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-sm"></div>
          </div>
        </div>
      )}
      {isPlay && video.base64Cover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPlay(false)} />

          {/* Image container */}
          <div className="relative max-w-[95vw] max-h-[95vh] rounded-xl overflow-hidden shadow-2xl border border-white/20">
            <video
              src={getAssetUrl(video.path, video.title)}
              poster={video.base64Cover}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain"
            />
            {/* Close indicator */}
            <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-sm"></div>
          </div>
        </div>
      )}
    </div>
  );
};
