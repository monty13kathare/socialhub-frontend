// // components/LeaveCommunityModal.tsx
// import { useState } from 'react';
// import type { Community } from '../types/types';
// import { leaveCommunity } from '../api/community';

// interface LeaveCommunityModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     community: Community | null;
// }

// export const LeaveCommunityModal: React.FC<LeaveCommunityModalProps> = ({
//     isOpen,
//     onClose,
//     community,
// }) => {
//     const [reason, setReason] = useState('');
//     const [error, setError] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);

//     if (!isOpen || !community) return null;

//     const handleClose = () => {
//         setReason('');
//         onClose();
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             const success = await leaveCommunity(community._id, reason);

//             if (success) {
//                 handleClose();
//             }
//         } catch (error) {
//             console.log("error", error)
//         } finally {
//             setIsLoading(false)
//         }

//     };

//     const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//         if (e.target === e.currentTarget) {
//             handleClose();
//         }
//     };

//     return (
//         <div
//             className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50"
//             onClick={handleBackdropClick}
//         >
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//                 {/* Header */}
//                 <div className="px-6 py-4 border-b border-gray-200">
//                     <h2 className="text-xl font-semibold text-gray-900">
//                         Leave Community
//                     </h2>
//                 </div>

//                 {/* Content */}
//                 <form onSubmit={handleSubmit}>
//                     <div className="px-6 py-4">
//                         {error && (
//                             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//                                 <p className="text-red-800 text-sm">{error}</p>
//                             </div>
//                         )}

//                         <div className="mb-4">
//                             <p className="text-gray-700 mb-3">
//                                 Are you sure you want to leave{' '}
//                                 <span className="font-semibold text-gray-900">
//                                     {community.name}
//                                 </span>
//                                 ?
//                             </p>

//                             {community.creator && (
//                                 <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
//                                     <p className="text-yellow-800 text-sm">
//                                         ⚠️ You are the owner of this community. Leaving will transfer
//                                         ownership to another member or delete the community if you're
//                                         the only member.
//                                     </p>
//                                 </div>
//                             )}

//                             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                                 <div className="flex justify-between text-sm text-gray-600">
//                                     <span>Members:</span>
//                                     <span>{community.members.length || 1}</span>
//                                 </div>
//                                 {community.description && (
//                                     <div className="mt-2 text-sm text-gray-600">
//                                         <span className="font-medium">Description:</span>
//                                         <p className="mt-1">{community.description}</p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="mb-4">
//                             <label
//                                 htmlFor="reason"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Reason for leaving (optional)
//                             </label>
//                             <textarea
//                                 id="reason"
//                                 value={reason}
//                                 onChange={(e) => setReason(e.target.value)}
//                                 placeholder="Tell us why you're leaving..."
//                                 rows={3}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                                 disabled={isLoading}
//                             />
//                         </div>
//                     </div>

//                     {/* Footer */}
//                     <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
//                         <button
//                             type="button"
//                             onClick={handleClose}
//                             disabled={isLoading}
//                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={isLoading}
//                             className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                         >
//                             {isLoading ? (
//                                 <>
//                                     <svg
//                                         className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <circle
//                                             className="opacity-25"
//                                             cx="12"
//                                             cy="12"
//                                             r="10"
//                                             stroke="currentColor"
//                                             strokeWidth="4"
//                                         ></circle>
//                                         <path
//                                             className="opacity-75"
//                                             fill="currentColor"
//                                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                         ></path>
//                                     </svg>
//                                     Leaving...
//                                 </>
//                             ) : (
//                                 'Leave Community'
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };