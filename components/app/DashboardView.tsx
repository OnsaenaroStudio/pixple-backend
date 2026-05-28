"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface DashboardViewProps {
  analytics: {
    totalScans: number;
    cacheHitsPct: number;
    avgConfidence: number;
    lastAnalyzed: string;
  };
  configStatus: {
    supabaseConfigured: boolean;
    supabaseUrl: string | null;
    apiKeyConfigured: boolean;
  };
  setActiveTab: (tab: "dashboard" | "analysis_api" | "community_api" | "settings" | "api_docs") => void;
  onViewSchemaSpecs: () => void;
}

export default function DashboardView({
  analytics,
  configStatus,
  setActiveTab,
  onViewSchemaSpecs
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Stat Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl">
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Total API Scans</p>
          <p className="text-2xl font-bold font-mono text-[#111827]">{analytics.totalScans.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl">
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Cache Hit Efficiency</p>
          <p className="text-2xl font-bold font-mono text-[#111827]">{analytics.cacheHitsPct}%</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl">
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Model Precision</p>
          <p className="text-2xl font-bold font-mono text-[#111827]">{analytics.avgConfidence}%</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl bg-[#EFF6FF]/40 border-[#EFF6FF]">
          <p className="text-[10px] text-[#1D4ED8] font-bold uppercase tracking-wider mb-1">Active Model</p>
          <p className="text-sm font-bold text-[#1D4ED8] mt-1">gemini-2.5-flash</p>
        </div>
      </div>

      {/* Main Information Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side column: Active specifications */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#111827] text-base">Pixple API Endpoint Registry</h2>
              <span className="text-xs text-[#6B7280] font-medium font-mono">Status: active</span>
            </div>

            <div className="space-y-3">
              {/* Endpoint list item */}
              <div
                onClick={() => setActiveTab("analysis_api")}
                className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                    POST
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">/api/gemini-api</p>
                    <p className="text-xs text-[#9CA3AF]">Extract food allergens from payload images via Google AI</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Endpoint list item */}
              <div
                onClick={() => setActiveTab("community_api")}
                className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold bg-[#E5E7EB] text-[#374151] px-2 py-0.5 rounded border border-[#CBD5E1]">
                    POST
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">/api/community/write</p>
                    <p className="text-xs text-[#9CA3AF]">Publish a new discussion topic to the backend pool</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Endpoint list item */}
              <div
                onClick={() => setActiveTab("community_api")}
                className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    GET
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">/api/community</p>
                    <p className="text-xs text-[#9CA3AF]">Query discussion topics with pagination filters</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Endpoint list item */}
              <div
                onClick={() => setActiveTab("community_api")}
                className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">
                    POST
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">/api/community/comment/write</p>
                    <p className="text-xs text-[#9CA3AF]">Add comments directly linked with a specific article identity</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Integration checklist */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="font-bold text-[#111827] text-base mb-3">API Environment Guide</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              The core backplane allows seamless connection with Supabase (Database Layer) and Gemini Pro (AI Layer) for allergen analyses. Enable these capabilities by registering environment variables.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6]">
                <span className="text-xs font-bold font-mono text-[#374151]">SUPABASE_URL</span>
                <span className="text-xs text-[#9CA3AF]">
                  {configStatus.supabaseConfigured ? "Configured (Connected)" : "Missing from environment"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6]">
                <span className="text-xs font-bold font-mono text-[#374151]">SUPABASE_ANON_KEY</span>
                <span className="text-xs text-[#9CA3AF]">
                  {configStatus.supabaseConfigured ? "Configured (Active)" : "Missing from environment"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6]">
                <span className="text-xs font-bold font-mono text-[#374151]">GEMINI_API_KEY</span>
                <span className="text-xs text-[#9CA3AF]">
                  {configStatus.apiKeyConfigured ? "Configured (Connected)" : "Using playground simulated values"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right side column: Live Quick Analytics logs */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 h-full flex flex-col">
            <div className="pb-4 border-b border-[#F3F4F6] flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#111827]">Live Access Logs</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">POOL LIVE</span>
            </div>

            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-gray-500">POST /api/gemini-api</span>
                  <span className="text-[10px] text-green-500 font-bold">200 OK</span>
                </div>
                <p className="text-xs text-slate-700 leading-tight">Matched preset image {analytics.lastAnalyzed}.</p>
                <p className="text-[10px] text-gray-400">Time: Just now</p>
              </div>

              <div className="space-y-1 border-t border-gray-50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-gray-500">POST /api/community</span>
                  <span className="text-[10px] text-green-500 font-bold">200 OK</span>
                </div>
                <p className="text-xs text-slate-700 leading-tight">Returned active bullet topics feed.</p>
                <p className="text-[10px] text-gray-400">Time: 1m ago</p>
              </div>

              <div className="space-y-1 border-t border-gray-50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-gray-500">GET /api/db-status</span>
                  <span className="text-[10px] text-green-500 font-bold">200 OK</span>
                </div>
                <p className="text-xs text-slate-700 leading-tight">Connectivity diagnostics ping executed.</p>
                <p className="text-[10px] text-gray-400">Time: System mount</p>
              </div>
            </div>

            <button
              onClick={onViewSchemaSpecs}
              className="w-full mt-6 py-2.5 bg-[#111827] text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors uppercase tracking-wider text-center"
            >
              View Source Schema specs
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
