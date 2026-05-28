import { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import { createProductReview } from '@/lib/orders';
import { showToast } from '@/lib/notifications';

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  productId: number;
  productName: string;
  productImage?: string;
  onReviewSubmitted?: () => void;
}

export default function ProductReviewModal({
  isOpen,
  onClose,
  orderId,
  productId,
  productName,
  productImage,
  onReviewSubmitted,
}: ProductReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('Por favor selecciona una calificación', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await createProductReview(orderId, productId, rating, comment);
      showToast('Reseña enviada correctamente', 'success');
      onReviewSubmitted?.();
      onClose();
      // Reset form
      setRating(0);
      setComment('');
    } catch (error: any) {
      showToast(error.message || 'Error al enviar la reseña', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-xl font-bold text-primary-dark">Calificar producto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
            {productImage && (
              <div className="w-16 h-16 rounded flex-shrink-0 overflow-hidden bg-white border">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Producto</p>
              <p className="font-semibold text-sm text-primary-dark line-clamp-2">
                {productName}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary-dark">
              Calificación <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition transform hover:scale-110"
                >
                  <FaStar
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } transition`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-500">
              {rating > 0 ? (
                <span className="text-primary font-semibold">
                  {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                </span>
              ) : (
                'Selecciona tu calificación'
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary-dark">
              Tu reseña <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia con este producto..."
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isLoading || rating === 0}
            >
              {isLoading ? 'Enviando...' : 'Enviar reseña'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
