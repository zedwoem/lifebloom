"use client";

import React, { useState } from "react";
import { useSavedItems } from "@/lib/hooks/useSavedItems";
import { useAuth } from "@/lib/hooks/useAuth";
import { Heart, Search, Trash2, ExternalLink } from "lucide-react";

const TRANSLATIONS = {
  restrictedTitle: "Restricted Access",
  restrictedDesc: "Please sign in first to manage your saved items.",
  pageTitle: "Saved Collection",
  pageDesc: "Save calculators, articles, and product guides supporting your senior lifestyle.",
  searchPlaceholder: "Search items...",
  noItemsTitle: "No items found",
  noItemsDesc: "Try adjusting your tab filter or search keyword.",
  btnRemove: "Remove",
  btnExplore: "Explore",
  tabAll: "All",
  tabProduct: "Products",
  tabArticle: "Articles",
  tabVideo: "Videos",
  loading: "Loading your collections...",
  defaultTitle: "Saved Item",
  defaultVendor: "Wellness Hub"
};

export default function SavedItemsPage() {
  const { profile } = useAuth();
  const { savedItems, loading, toggleSaveItem } = useSavedItems();
  const [activeTab, setActiveTab] = useState<"all" | "product" | "article" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const t = TRANSLATIONS;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium">{t.loading}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h2 className="text-2xl font-black text-slate-800">{t.restrictedTitle}</h2>
        <p className="text-slate-500 mt-2">{t.restrictedDesc}</p>
      </div>
    );
  }

  // Filter items dynamically based on tabs and searchQuery
  const filteredItems = savedItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.item_type === activeTab;
    const itemName = item.metadata?.name || item.metadata?.title || t.defaultTitle;
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTabLabel = (tab: "all" | "product" | "article" | "video") => {
    if (tab === "all") return t.tabAll;
    if (tab === "product") return t.tabProduct;
    if (tab === "article") return t.tabArticle;
    return t.tabVideo;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t.pageTitle}</h1>
        <p className="text-slate-600 text-base mt-1">
          {t.pageDesc}
        </p>
      </header>

      {/* Control panel: tabs, search, and CSV export triggers */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        {/* Horizontal Tab Controller */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl w-full md:w-auto">
          {(["all", "product", "article", "video"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all flex-grow md:flex-grow-0 min-h-[40px] ${
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Client-Side search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-input"
            name="search"
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[48px]"
          />
        </div>
      </div>

      {/* Grid listing */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 p-16 text-center rounded-3xl">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-lg">{t.noItemsTitle}</p>
          <p className="text-slate-400 text-sm mt-1">{t.noItemsDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const title = item.metadata?.name || item.metadata?.title || t.defaultTitle;
            const subtitle = item.metadata?.vendor || item.metadata?.pillar || t.defaultVendor;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[180px]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{subtitle}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded capitalize">
                      {item.item_type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 leading-snug line-clamp-2 mt-2">{title}</h3>
                </div>

                {/* Card CTA Controls */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => toggleSaveItem(item.item_type, item.referenced_id)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.btnRemove}</span>
                  </button>

                  <a
                    href={`/api/affiliate/${item.metadata?.slug || item.referenced_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-brand-green text-white rounded-lg hover:bg-green-800 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                  >
                    <span>{t.btnExplore}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

