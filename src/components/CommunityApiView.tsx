import React from "react";
import { RefreshCw, ChevronRight, ChevronLeft, ThumbsUp } from "lucide-react";
import { Article, Comment } from "../types";

interface CommunityApiViewProps {
  articles: Article[];
  articlesLoading: boolean;
  activeArticle: Article | null;
  setActiveArticle: (art: Article | null) => void;
  newPostTitle: string;
  setNewPostTitle: (val: string) => void;
  newPostContent: string;
  setNewPostContent: (val: string) => void;
  newPostHashtags: string;
  setNewPostHashtags: (val: string) => void;
  postSubmitting: boolean;
  runCreatePostAPI: (e: React.FormEvent) => void;
  sessionUser: { name: string; id: string };
  setSessionUser: (val: { name: string; id: string }) => void;
  loadDashboardArticles: () => void;
  handleSelectArticleDetail: (art: Article) => void;
  comments: Comment[];
  commentsLoading: boolean;
  runLikeCommentAPI: (commentId: number) => void;
  newCommentText: string;
  setNewCommentText: (val: string) => void;
  commentSubmitting: boolean;
  runCreateCommentAPI: (e: React.FormEvent) => void;
}

export default function CommunityApiView({
  articles,
  articlesLoading,
  activeArticle,
  setActiveArticle,
  newPostTitle,
  setNewPostTitle,
  newPostContent,
  setNewPostContent,
  newPostHashtags,
  setNewPostHashtags,
  postSubmitting,
  runCreatePostAPI,
  sessionUser,
  setSessionUser,
  loadDashboardArticles,
  handleSelectArticleDetail,
  comments,
  commentsLoading,
  runLikeCommentAPI,
  newCommentText,
  setNewCommentText,
  commentSubmitting,
  runCreateCommentAPI
}: CommunityApiViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: API specifications & creation forms */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Setup API writer section */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="font-bold text-[#111827] text-base mb-1.5 flex items-center gap-1.5">
            ✍️ API: POST /api/community/write
          </h3>
          <p className="text-xs text-[#6B7280] mb-5">
            Write backplane logs. Push a clean JSON object containing title, description, and hashtags arrays.
          </p>

          <form onSubmit={runCreatePostAPI} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-1">
                Article Title
              </label>
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3B82F6]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-1">
                Content Body
              </label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full h-24 p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3B82F6]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-1">
                Comma Separated Hashtags
              </label>
              <input
                type="text"
                value={newPostHashtags}
                onChange={(e) => setNewPostHashtags(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3B82F6]"
                placeholder="이유식, 대두, 두부"
              />
            </div>

            <button
              type="submit"
              disabled={postSubmitting}
              className="w-full py-2.5 bg-[#111827] hover:bg-stone-800 disabled:bg-gray-100 disabled:text-gray-400 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {postSubmitting ? "Submitting payload..." : "Create Post (POST Payload)"}
            </button>
          </form>
        </div>

        {/* Database writer config details */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="font-bold text-[#111827] text-sm mb-2.5">Live Mock writer session settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">TESTER NICKNAME (user_name)</label>
              <input
                type="text"
                value={sessionUser.name}
                onChange={(e) => setSessionUser({ ...sessionUser, name: e.target.value })}
                className="w-full p-2 bg-[#FAFAFA] border border-gray-100 rounded-lg text-xs text-gray-600 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Dynamic Feed Reader Simulation */}
      <div className="lg:col-span-7 space-y-6">
        
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          
          {/* Title Bar */}
          <div className="pb-3 border-b border-[#F3F4F6] flex justify-between items-center mb-5">
            <h3 className="font-bold text-[#111827] text-base flex items-center gap-1.5">
              📖 Interactive Data Stream Parser
            </h3>
            <button
              onClick={loadDashboardArticles}
              className="p-1 px-2.5 border border-gray-200 rounded text-xs hover:bg-gray-50 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw size={11} /> Refresh Feed
            </button>
          </div>

          {/* Standard feed view vs thread view */}
          {!activeArticle ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 italic mb-1">
                Select a live thread below to view dynamic responses from <code className="bg-[#F3F4F6] px-1 py-0.5 rounded text-xs">/api/community/comment</code>.
              </p>

              {articlesLoading && articles.length === 0 ? (
                <div className="py-20 flex justify-center items-center">
                  <RefreshCw size={24} className="text-[#3B82F6] animate-spin" />
                </div>
              ) : articles.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  Bulletin feed is currently empty. Push a new topic using the endpoint form!
                </div>
              ) : (
                articles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArticleDetail(art)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-[#3B82F6] bg-white transition cursor-pointer flex justify-between items-start"
                  >
                    <div className="space-y-1 overflow-hidden pr-3">
                      <h4 className="text-sm font-bold text-[#111827] truncate hover:text-[#1D4ED8]">
                        {art.article_title}
                      </h4>
                      <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                        {art.article_content}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {art.article_hash_tag.map((tag, i) => (
                          <span key={i} className="text-[9px] bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#9CA3AF] shrink-0 mt-1" />
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Thread view */
            <div className="space-y-5">
              
              {/* Back button */}
              <button
                onClick={() => setActiveArticle(null)}
                className="py-1 px-2 text-[#3B82F6] hover:bg-blue-50 hover:text-[#1D4ED8] rounded-md text-xs font-bold flex items-center gap-1 transition cursor-pointer outline-none"
              >
                <ChevronLeft size={14} /> Back to API Registry Feed
              </button>

              {/* Header details */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] uppercase font-extrabold text-[#9CA3AF] tracking-wider mb-1 block">Topic Profile</span>
                <h4 className="text-base font-bold text-[#111827]">{activeArticle.article_title}</h4>
                <p className="text-xs text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">{activeArticle.article_content}</p>
                
                <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] mt-4 pt-3 border-t border-gray-200">
                  <span className="font-mono">ARTICLE ID: {activeArticle.id}</span>
                  <span className="font-bold">{new Date(activeArticle.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Comments feed integration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-[#111827] text-xs uppercase tracking-wider text-gray-500">
                    Comments Dynamic Payload (/api/community/comment)
                  </h5>
                  {commentsLoading && <RefreshCw size={12} className="animate-spin text-gray-400" />}
                </div>

                {comments.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 italic">
                    No comments attached to this article ID yet. Publish the initial payload below!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comments.map((c) => (
                      <div key={c.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-800">{c.user_name}</span>
                            <span className="text-[9px] font-mono text-gray-400">({c.user_id})</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{c.content}</p>
                          <span className="block text-[9px] text-[#9CA3AF]">{new Date(c.created_at).toLocaleString()}</span>
                        </div>

                        <button
                          onClick={() => runLikeCommentAPI(c.id)}
                          className="py-1 px-2.5 border border-gray-100 hover:border-blue-100 bg-gray-50/50 hover:bg-blue-50 text-gray-500 hover:text-[#1D4ED8] rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer outline-none"
                        >
                          <ThumbsUp size={11} />
                          <span>{c.likes}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive comment form submission */}
                <form onSubmit={runCreateCommentAPI} className="border-t border-gray-150 pt-4 space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-extrabold text-[#9CA3AF] mb-1">
                      Publish comment via POST Payload
                    </label>
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full p-2.5 bg-[#FAFAFA] border border-gray-250 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-[#3B82F6]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="py-2 px-4 bg-[#3B82F6] hover:bg-blue-600 font-bold text-white text-xs rounded-lg transition cursor-pointer"
                  >
                    {commentSubmitting ? "Posting..." : "POST Comment"}
                  </button>
                </form>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
