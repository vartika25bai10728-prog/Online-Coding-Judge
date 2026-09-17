import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Plus, Tag, Send, X, ArrowLeft } from 'lucide-react';
import { Discussion, Comment } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface DiscussionsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] = useState<{ discussion: Discussion; comments: Comment[] } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Dynamic Programming');
  const [commentText, setCommentText] = useState('');

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const data = await api.getDiscussions();
      setDiscussions(data);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleOpenDiscussion = async (id: string) => {
    try {
      const data = await api.getDiscussion(id);
      setSelectedDiscussion(data);
    } catch (err) {
      console.error('Failed to open discussion:', err);
    }
  };

  const handleVote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const updated = await api.voteDiscussion(id);
      setDiscussions(prev => prev.map(d => d.id === id ? updated : d));
      if (selectedDiscussion && selectedDiscussion.discussion.id === id) {
        setSelectedDiscussion({ ...selectedDiscussion, discussion: updated });
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await api.createDiscussion({ title, content, tags: [tag] });
      setIsCreating(false);
      setTitle('');
      setContent('');
      fetchDiscussions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedDiscussion || !commentText.trim()) return;

    try {
      const newComment = await api.addComment(selectedDiscussion.discussion.id, commentText);
      setSelectedDiscussion({
        ...selectedDiscussion,
        comments: [...selectedDiscussion.comments, newComment],
        discussion: {
          ...selectedDiscussion.discussion,
          commentCount: selectedDiscussion.discussion.commentCount + 1
        }
      });
      setCommentText('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Discussions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discuss problems, ask questions, and share solution approaches.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) openAuthModal();
            else setIsCreating(true);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Main View */}
      {selectedDiscussion ? (
        /* Discussion Thread View */
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6">
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Discussions</span>
          </button>

          {/* Main Question / Post */}
          <div className="space-y-3 pb-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedDiscussion.discussion.userAvatar}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <span className="font-semibold text-white text-sm">
                  {selectedDiscussion.discussion.username}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(selectedDiscussion.discussion.createdAt).toLocaleDateString()}
                </span>
              </div>

              <button
                onClick={(e) => handleVote(e, selectedDiscussion.discussion.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{selectedDiscussion.discussion.upvotes} Upvotes</span>
              </button>
            </div>

            <h2 className="text-xl font-bold text-white">{selectedDiscussion.discussion.title}</h2>
            <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
              {selectedDiscussion.discussion.content}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedDiscussion.discussion.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white font-mono">
              Comments ({selectedDiscussion.comments.length})
            </h3>

            {/* Comment list */}
            <div className="space-y-3">
              {selectedDiscussion.comments.map((c) => (
                <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={c.userAvatar} alt="" className="w-5 h-5 rounded-full" />
                      <span className="font-semibold text-slate-200">{c.username}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a response or solution critique..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Discussions List */
        <div className="space-y-3">
          {discussions.map((d) => (
            <div
              key={d.id}
              onClick={() => handleOpenDiscussion(d.id)}
              className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex items-start justify-between gap-4 transition-all cursor-pointer group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <img src={d.userAvatar} alt="" className="w-5 h-5 rounded-full" />
                  <span className="text-xs font-semibold text-slate-300">{d.username}</span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                  {d.problemTitle && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900">
                      Problem: {d.problemTitle}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {d.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{d.content}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {d.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Side Metric Stats */}
              <div className="flex items-center gap-3 shrink-0 pt-1 text-xs font-mono">
                <button
                  onClick={(e) => handleVote(e, d.id)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{d.upvotes}</span>
                </button>
                <span className="flex items-center gap-1 text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{d.commentCount}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Discussion Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Start a New Discussion</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. O(N) Two-Pass approach vs O(1) Space with Bitwise operations"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic Category</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Dynamic Programming">Dynamic Programming</option>
                  <option value="Two Pointers">Two Pointers</option>
                  <option value="Binary Search">Binary Search</option>
                  <option value="Graph Theory">Graph Theory</option>
                  <option value="System Design">System Design</option>
                  <option value="Interview Advice">Interview Advice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content / Explanation</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain your approach, time/space complexity analysis, or question..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
