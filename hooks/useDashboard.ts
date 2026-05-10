"use client";

import { useEffect, useRef, useState } from "react";
import { searchDashboard } from "@/services/dashboardService";
import { useBlockList } from "./useBlockList";
import type { DashboardSearchResult, SearchCategory, UserSearchResult } from "@/lib/types";

export function useDashboardSearch() {
    const [searchCategory, setSearchCategory] = useState<SearchCategory>("Personne");
    const [searchQuery, setSearchQuery]       = useState("");
    const [searchResults, setSearchResults]   = useState<DashboardSearchResult[]>([]);
    const [isSearching, setIsSearching]       = useState(false);
    const [searchOpen, setSearchOpen]         = useState(false);
    const [dropOpen, setDropOpen]             = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { isUserBlocked } = useBlockList();

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        debounceRef.current = setTimeout(async () => {
            const result = await searchDashboard(searchQuery, searchCategory);

            if (result.success && result.data) {
                const filtered =
                    searchCategory === "Personne"
                        ? result.data.filter((item: DashboardSearchResult) => {
                              if (item.type !== "user") return true;
                              return !isUserBlocked((item as UserSearchResult).id);
                          })
                        : result.data;
                setSearchResults(filtered);
            } else {
                setSearchResults([]);
            }
            setIsSearching(false);
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, searchCategory, isUserBlocked]);

    const changeCategory = (cat: SearchCategory) => {
        setSearchCategory(cat);
        setSearchQuery("");
        setSearchResults([]);
        setDropOpen(false);
    };

    const showDropdown = searchOpen && searchQuery.trim().length > 0;

    return {
        searchCategory, searchQuery, setSearchQuery,
        searchResults, isSearching,
        searchOpen, setSearchOpen,
        dropOpen, setDropOpen,
        showDropdown, changeCategory,
    };
}