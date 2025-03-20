import { useState } from 'react';

interface BookingActionsProps {
  bookingId: string;
  status: string;
  isUpdating: boolean;
  onUpdate: (id: string, status: string) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
  onView: (id: string) => void;
  showViewButton?: boolean;
}

export default function BookingActions({
  bookingId,
  status,
  isUpdating,
  onUpdate,
  onDelete,
  onView,
  showViewButton = false,
}: BookingActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'status' | 'delete' | null>(null);
  const [newStatus, setNewStatus] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const openConfirm = (type: 'status' | 'delete', status?: string) => {
    setActionType(type);
    setNewStatus(status || null);
    setIsConfirmOpen(true);
    closeMenu();
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setActionType(null);
    setNewStatus(null);
  };

  const handleUpdateStatus = async () => {
    if (newStatus && !isUpdating) {
      try {
        await onUpdate(bookingId, newStatus);
        closeConfirm();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!isUpdating) {
      try {
        const success = await onDelete(bookingId);
        if (success) {
          closeConfirm();
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  // Helper to get appropriate button classes based on status
  const getStatusButtonClasses = (targetStatus: string) => {
    const baseClasses = "text-sm px-2 py-1 rounded transition-colors";
    const isCurrentStatus = status === targetStatus;
    
    if (isCurrentStatus) {
      return `${baseClasses} bg-gray-200 text-gray-700 cursor-default`;
    }
    
    const statusStyles: Record<string, string> = {
      'CONFIRMED': 'hover:bg-green-100 hover:text-green-800',
      'PENDING': 'hover:bg-yellow-100 hover:text-yellow-800',
      'CANCELLED': 'hover:bg-red-100 hover:text-red-800',
      'COMPLETED': 'hover:bg-blue-100 hover:text-blue-800',
    };
    
    return `${baseClasses} hover:bg-gray-100 ${statusStyles[targetStatus] || ''}`;
  };

  return (
    <div className="relative">
      {/* Actions dropdown button */}
      <div className="flex space-x-2">
        {showViewButton && (
          <button
            onClick={() => onView(bookingId)}
            className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm font-medium rounded hover:bg-blue-50 transition-colors"
          >
            View
          </button>
        )}
        
        <button 
          onClick={toggleMenu}
          disabled={isUpdating}
          className="text-gray-700 hover:text-gray-900 px-2 py-1 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
        >
          {isUpdating ? 'Processing...' : 'Actions ▾'}
        </button>
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
              Status
            </div>
            {status !== 'CONFIRMED' && (
              <button
                onClick={() => openConfirm('status', 'CONFIRMED')}
                disabled={status === 'CONFIRMED'}
                className={getStatusButtonClasses('CONFIRMED') + ' w-full text-left px-4 py-2'}
              >
                Confirm
              </button>
            )}
            {status !== 'PENDING' && (
              <button
                onClick={() => openConfirm('status', 'PENDING')}
                disabled={status === 'PENDING'}
                className={getStatusButtonClasses('PENDING') + ' w-full text-left px-4 py-2'}
              >
                Mark as Pending
              </button>
            )}
            {status !== 'COMPLETED' && (
              <button
                onClick={() => openConfirm('status', 'COMPLETED')}
                disabled={status === 'COMPLETED'}
                className={getStatusButtonClasses('COMPLETED') + ' w-full text-left px-4 py-2'}
              >
                Mark as Completed
              </button>
            )}
            {status !== 'CANCELLED' && (
              <button
                onClick={() => openConfirm('status', 'CANCELLED')}
                disabled={status === 'CANCELLED'}
                className={getStatusButtonClasses('CANCELLED') + ' w-full text-left px-4 py-2'}
              >
                Cancel
              </button>
            )}
            <div className="border-t my-1"></div>
            <button
              onClick={() => openConfirm('delete')}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 w-full text-left px-4 py-2 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'delete' 
                ? 'Confirm Deletion' 
                : `Change Status to ${newStatus}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {actionType === 'delete'
                ? 'Are you sure you want to delete this booking? This action cannot be undone.'
                : `Are you sure you want to change the booking status to ${newStatus}?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'delete' ? handleDelete : handleUpdateStatus}
                disabled={isUpdating}
                className={`px-4 py-2 text-sm font-medium text-white rounded ${
                  actionType === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUpdating ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 