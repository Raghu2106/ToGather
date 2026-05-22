/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FeedPost } from '../types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  MoreVertical, 
  Flame,
  Plus, 
  Check,
  Send
} from 'lucide-react';

interface FeedTabProps {
  posts: FeedPost[];
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onAddNewPost: (text: string, tag: string) => void;
  isLoggedIn: boolean;
  onShowAuthModal: () => void;
}

export default function FeedTab({ 
  posts, 
  onToggleLike, 
  onToggleBookmark, 
  onAddNewPost,
  isLoggedIn,
  onShowAuthModal
}: FeedTabProps) {
  const [selectedTag, setSelectedTag] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [postTag, setPostTag] = useState('#General');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // Custom mock join for internal BBQ callout
  const [bbqJoined, setBbqJoined] = useState(false);

  // Interest tags
  const tagsList = ['All', '#Hiking', '#Pottery', '#Cooking', '#Yoga', '#Community'];

  // Filter posts based on tags
  const filteredPosts = posts.filter(post => {
    if (selectedTag === 'All') return true;
    return post.tags.includes(selectedTag) || (post.tags.length === 0 && selectedTag === '#Community' && post.quote);
  });

  // Handle create post submit
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (!postText.trim()) return;
    onAddNewPost(postText, postTag);
    setPostText('');
    setPostTag('#General');
    setShowCreateModal(false);
  };

  const handleAddComment = (postId: string) => {
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (!commentText.trim()) return;
    // Increment local state comments count or mock alert
    alert(`Success: Your comment has been posted to this cluster update!`);
    setCommentText('');
    setActiveCommentsPostId(null);
  };

  return (
    <div className="pb-16 relative">
      {/* Horizontal Category Chips */}
      <section className="mb-6 overflow-x-auto hide-scrollbar flex gap-2 py-2 shrink-0">
        {tagsList.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-semibold text-xs tracking-tight transition-all cursor-pointer ${
              (selectedTag === 'All' && tag === 'All') || selectedTag === tag
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-tertiary-container/10 text-tertiary hover:bg-tertiary-container/20'
            }`}
          >
            {tag === 'All' ? 'All Feed' : tag}
          </button>
        ))}
      </section>

      {/* Feed Stream */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-outline-variant/30 shadow-xs">
            <p className="text-on-surface-variant text-sm">No updates currently available in {selectedTag}.</p>
            <button 
              onClick={() => setSelectedTag('All')}
              className="mt-3 text-primary text-sm font-bold hover:underline cursor-pointer"
            >
              Reset to all updates
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const hasPotteryGrid = post.image === 'POTTERY_GRID';
            
            return (
              <article 
                key={post.id} 
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-xs hover:shadow-md transition-shadow relative"
              >
                {/* Post Author Bar */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.avatar} 
                      alt={post.author} 
                      className="w-11 h-11 rounded-full object-cover shadow-xs border border-outline-variant/10" 
                    />
                    <div>
                      <p className="font-bold text-sm text-on-surface">{post.author}</p>
                      <p className="text-[11px] text-on-surface-variant">{post.subtext}</p>
                    </div>
                  </div>
                  <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-full cursor-pointer">
                    <MoreVertical className="w-5 h-5 text-outline" />
                  </button>
                </div>

                {/* Post Graphic Media */}
                {post.image && !hasPotteryGrid && (
                  <div className="aspect-video w-full overflow-hidden bg-surface-container-high border-y border-outline-variant/15">
                    <img 
                      src={post.image} 
                      alt="Local update capture" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}

                {/* Handled special pottery image grid as seen in Marcus post screen */}
                {hasPotteryGrid && (
                  <div className="grid grid-cols-2 gap-1 h-[260px] bg-surface-container-high border-y border-outline-variant/15">
                    <div className="overflow-hidden">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTxNxqYQKa2JBxUFde8CsL-7LAktWdaQwEPZGC9xRsAz4UC8iUUmjfxV5QanICzdKxMVPvX2cFkzNGvVvlwwYJ8xheAL5JZIh9Gdxw9lpqtkJnjW0SfEfVImqbOFU7fTSmKpeFixjWFqOtt6gSTstG5LRhJW_gATy3lwVnNdmS3JPr7J6MxZHffOYxGhqIwncWi3UpNJLg22rM5qQ-nb6DK6EXLY9fCATYRjcFNVxTrQCrdHE5-DzSZCNMSeItzpywAhZ5_1SjGig" 
                        alt="Handcrafted ceramic process" 
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-500" 
                      />
                    </div>
                    <div className="overflow-hidden">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnHgfTF9gJqxc7Y2BXHI928Yq4RQplbkX-Bw3YYdUFO5h_ijhhyQhmd7UGrhScX22ycPteHnxOUWaF-U8yXOy12D_W4F7x_3gr88cbGxFq9MKO_X30I1zsEhhJa-rn5UGLpU5sYfOF85I_iNCl03RoUyq28N1Mkl-TubS879vqW0gg6NrwYyIpgIXzEARbNgWgswXR6y7jsv0XS5TiCU9_cPqK6tjncUC5_JHgu7IFMcSs90fh3zruhXGNQMNkyxOepc-dgVb7FvE" 
                        alt="Pastel pottery collections glazes" 
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-500" 
                      />
                    </div>
                  </div>
                )}

                {/* Custom Quote Layout (Elena post) */}
                {post.quote && (
                  <div className="px-4 pb-3">
                    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 italic text-on-surface-variant text-sm leading-relaxed shrink-0">
                      {post.quote.text}
                    </div>
                  </div>
                )}

                {/* Content text metadata and interactive keys */}
                <div className="p-4">
                  {post.text && (
                    <p className="text-sm text-on-surface leading-relaxed mb-3">
                      {post.text}
                    </p>
                  )}

                  {/* Dynamic hashtags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 shrink-0">
                      {post.tags.map(t => (
                        <span key={t} className="text-secondary font-bold text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer interaction buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => onToggleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
                          post.isLiked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        <Heart className={`w-5 h-5 group-active:scale-125 transition-transform ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-semibold">{post.likes}</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                        className={`flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer ${
                          activeCommentsPostId === post.id ? 'text-primary' : ''
                        }`}
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-xs font-semibold">{post.commentsCount}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          const link = window.location.href;
                          navigator.clipboard.writeText(link);
                          alert('Success: Community share link copied to clipboard!');
                        }}
                        className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onToggleBookmark(post.id)}
                        className={`transition-colors cursor-pointer ${
                          post.isBookmarked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Active Comment Drawer panel */}
                  {activeCommentsPostId === post.id && (
                    <div className="mt-4 pt-3 border-t border-outline-variant/10 flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add a public comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-grow bg-surface-container-low border-none rounded-xl text-xs px-3 focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface py-2"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="bg-primary text-on-primary p-2 rounded-xl active:scale-95 transition-all text-xs flex items-center justify-center cursor-pointer font-semibold"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>
              </article>
            );
          })
        )}

        {/* Suggestion BBQ Callout Box as seen in bottom of screen */}
        {selectedTag === 'All' && (
          <aside className="bg-secondary-container/10 rounded-2xl p-4 border border-secondary-container/30 flex items-center gap-4 mt-4 select-none">
            <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0 font-bold">
              🔥
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Recommended for you</p>
              <h3 className="font-bold text-sm text-on-surface truncate">Backyard BBQ Enthusiasts</h3>
              <p className="text-on-surface-variant text-xs mt-0.5">42 members active now</p>
            </div>
            <button 
              onClick={() => {
                if (!isLoggedIn) {
                  onShowAuthModal();
                  return;
                }
                setBbqJoined(!bbqJoined);
                alert(bbqJoined ? 'You left Sandbox Backyard BBQ.' : 'Success: Joined Backyard BBQ Enthusiasts!');
              }}
              className={`px-4 py-2 rounded-full font-bold text-xs active:scale-90 transition-all shrink-0 cursor-pointer ${
                bbqJoined 
                  ? 'bg-surface-container-high text-on-surface'
                  : 'bg-primary text-on-primary hover:bg-primary/95'
              }`}
            >
              {bbqJoined ? 'Joined' : 'Join'}
            </button>
          </aside>
        )}
      </div>

      {/* Floating Action Button (FAB) at bottom-right of screen */}
      <button 
        onClick={() => {
          if (!isLoggedIn) {
            onShowAuthModal();
            return;
          }
          setShowCreateModal(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-transform z-40 cursor-pointer shadow-primary/20"
      >
        <Plus className="w-6 h-6 animate-pulse" />
      </button>

      {/* Full Creating Post Modal over current canvas */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-on-surface mb-1">Create Update</h3>
            <p className="text-xs text-on-surface-variant mb-4">Share what your community is up to</p>
            
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Update Copy</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Conquered a ridge? Finished a painting? Share here..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Primary Hashtag</label>
                <select
                  value={postTag}
                  onChange={(e) => setPostTag(e.target.value)}
                  className="w-full p-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary text-on-surface"
                >
                  <option value="#Community">#Community</option>
                  <option value="#Hiking">#Hiking</option>
                  <option value="#Pottery">#Pottery</option>
                  <option value="#Cooking">#Cooking</option>
                  <option value="#Yoga">#Yoga</option>
                  <option value="#General">#General</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-outline rounded-xl hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl active:scale-95 transition-transform"
                >
                  Post Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
