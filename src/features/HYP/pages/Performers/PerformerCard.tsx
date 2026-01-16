import { Edit, Globe, Star, Tag, Trash } from 'lucide-react';
import { PerformerDetailVo } from '@/lib/bindings/PerformerDetailVo';
import { localFileToUrl } from '@/utils/path';

type Props = {
  performer: PerformerDetailVo;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export const PerformerCard = ({ performer, onEdit, onDelete }: Props) => {
  const renderRating = (rating: number) => {
    const starRating = rating / 20;
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let ratingColor = 'text-green-400';
    if (rating >= 90) ratingColor = 'text-emerald-400';
    else if (rating >= 80) ratingColor = 'text-green-400';
    else if (rating >= 70) ratingColor = 'text-yellow-400';
    else if (rating >= 60) ratingColor = 'text-orange-400';
    else ratingColor = 'text-red-400';

    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 fill-current ${ratingColor}`} />
          ))}
          {hasHalfStar && (
            <div className="relative w-5 h-5">
              <Star className="w-5 h-5 text-gray-600" />
              <div className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className={`w-5 h-5 fill-current ${ratingColor}`} />
              </div>
            </div>
          )}
          {[...Array(emptyStars)].map((_, i) => (
            <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className="w-5 h-5 text-gray-600" />
          ))}
        </div>
        <span className={`font-bold ${ratingColor}`}>{performer.rating}/100</span>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl opacity-20 blur"></div>

      <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300">
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{performer.name}</h2>
            {performer.country && (
              <div className="flex items-center space-x-2 text-gray-300">
                <Globe className="w-4 h-4" />
                <span className="text-sm">{performer.country}</span>
              </div>
            )}
          </div>
          <div className="mt-2">{renderRating(performer.rating)}</div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative overflow-hidden rounded-xl border border-gray-700/50">
                  {performer.imagePath ? (
                    <img
                      src={localFileToUrl(performer.imagePath, performer.name)}
                      alt={performer.name}
                      className="w-48 h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-48 h-64 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <div className="text-gray-500 text-lg">No Image</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center mb-4">
                <Tag className="w-5 h-5 text-violet-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Specialties</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {performer.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-3 py-1.5 bg-gray-700/50 hover:bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-full text-sm font-medium transition-all duration-200 hover:border-violet-400/50 hover:text-violet-200 cursor-pointer">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">ID: {performer.id}</div>
              <div className="flex space-x-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(performer.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-violet-400/50 hover:text-violet-200">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(performer.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-rose-400/50 hover:text-rose-200">
                    <Trash className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!onEdit && !onDelete && (
          <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>ID: {performer.id}</span>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                <span>Active Profile</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
