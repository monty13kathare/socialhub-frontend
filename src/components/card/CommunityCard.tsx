import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/userStorage";
import { deleteCommunity } from "../../api/community";
import EditCommunityModal from "../../model/EditCommunityModal";
import DeleteModal from "../../model/DeleteModal";


interface CommunityCardProps {
  community: any;
  toggleJoinCommunity: (community: any) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  toggleJoinCommunity,
}) => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const isOwner = currentUser?._id === community?.createdBy?._id;
  const isMember = community?.members?.some(
  (m: any) => m.user._id === currentUser?._id
);

  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    navigate(`/communities/${community._id}`, { state: { community } });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

   const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

 

  const handleUpdateCommunity = () => {
    // onUpdateCommunity(updatedCommunity);
    setIsEditModalOpen(false);
  };


    const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteCommunity(community._id);
      setIsDeleteModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting community:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-200 group cursor-pointer"
      >
        {/* Banner */}
        <div className={`h-24 bg-linear-to-r ${community?.bannerColor} relative`}>
          <div className="absolute top-3 right-3 flex gap-2">
            {isOwner && (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 bg-white/20 text-white backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 cursor-pointer"
                  title="Edit Community"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="p-2 bg-red-600/20 text-red-300 backdrop-blur-sm rounded-lg hover:bg-red-600/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  title="Delete Community"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </>
            )}
            {!isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleJoinCommunity(community);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isMember
                    ? "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                    : "bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                {isMember ? "Joined" : "Join"}
              </button>
            )}
          </div>
        </div>

          <div className="absolute top-8 left-4 w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl backdrop-blur-sm border border-white/30">
                {community.name.charAt(0)}
              </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors duration-200">
              {community?.name}
            </h3>
          </div>

          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {community?.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
            <div className="flex items-center space-x-4">
              <span>👥 {community?.members?.length || "0"}</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{community?.members?.length || "0"} online</span>
              </span>
            </div>
            <span className="capitalize text-slate-500">{community?.privacy}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {community?.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCommunityModal
        community={community}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateCommunity}
      />
          {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Community"
        message={`Are you sure you want to delete "${community.name}"? This action cannot be undone and all community data will be permanently lost.`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default CommunityCard;