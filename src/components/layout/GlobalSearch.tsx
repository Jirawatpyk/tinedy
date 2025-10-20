import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useUiStore } from '../../store/uiStore';
import { useBookingStore } from '../../store/bookingStore';
import { useCustomerStore } from '../../store/customerStore';
import { useStaffStore } from '../../store/staffStore';
import { Booking, Customer, StaffMember } from '../../types';
import { ListBulletIcon, UsersIcon, BriefcaseIcon } from '../ui/icons';
import SearchInput from '../ui/SearchInput';

type SearchResult = 
    | { type: 'booking'; item: Booking }
    | { type: 'customer'; item: Customer; matchContext?: string }
    | { type: 'staff'; item: StaffMember };

const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    const containerRef = useRef<HTMLDivElement>(null);

    // Data from stores
    const allBookings = useBookingStore(state => state.bookings);
    const allCustomers = useCustomerStore(state => state.customers);
    const allStaff = useStaffStore(state => state.staff);
    const { setActiveView, resetBookingFilters, setBookingFilters, resetCustomerFilters, setCustomerFilters, resetStaffFilters, setStaffFilters } = useUiStore();

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            return;
        }

        const lowerCaseQuery = debouncedQuery.toLowerCase();
        
        const addedCustomerIds = new Set<string>();
        const customerResults: SearchResult[] = [];

        // Prioritize name/email matches
        allCustomers.forEach(c => {
            if (c.name.toLowerCase().includes(lowerCaseQuery) || c.email.toLowerCase().includes(lowerCaseQuery)) {
                customerResults.push({ type: 'customer', item: c });
                addedCustomerIds.add(c.id);
            }
        });

        // Then add tag matches for customers not already in the list
        allCustomers.forEach(c => {
            if (!addedCustomerIds.has(c.id) && c.tags) {
                const matchingTag = c.tags.find(tag => tag.name.toLowerCase().includes(lowerCaseQuery));
                if (matchingTag) {
                    customerResults.push({ type: 'customer', item: c, matchContext: `Tag: ${matchingTag.name}` });
                    addedCustomerIds.add(c.id);
                }
            }
        });

        const staffResults: SearchResult[] = allStaff
            .filter(s => s.name.toLowerCase().includes(lowerCaseQuery) || s.email.toLowerCase().includes(lowerCaseQuery))
            .map(item => ({ type: 'staff', item }));

        // Search bookings by customer name
        const bookingResults: SearchResult[] = allBookings
            .filter(b => b.customer.name.toLowerCase().includes(lowerCaseQuery))
            .map(item => ({ type: 'booking', item }));

        setResults([...customerResults, ...staffResults, ...bookingResults].slice(0, 10)); // Limit total results

    }, [debouncedQuery, allBookings, allCustomers, allStaff]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (result: SearchResult) => {
        switch (result.type) {
            case 'customer':
                setActiveView('customers');
                resetCustomerFilters();
                if (result.matchContext?.startsWith('Tag:')) {
                    const tagName = result.matchContext.replace('Tag: ', '');
                    setCustomerFilters({ tag: tagName });
                } else {
                    setCustomerFilters({ searchQuery: result.item.name });
                }
                break;
            case 'staff':
                setActiveView('staff');
                resetStaffFilters();
                setStaffFilters({ searchQuery: result.item.name });
                break;
            case 'booking':
                setActiveView('bookings');
                resetBookingFilters();
                setBookingFilters({ searchQuery: result.item.customer.name });
                break;
        }
        setQuery('');
        setResults([]);
        setIsFocused(false);
    };
    
    const groupedResults = useMemo(() => {
        return results.reduce((acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = [];
            }
            acc[result.type].push(result);
            return acc;
        }, {} as Record<SearchResult['type'], SearchResult[]>);
    }, [results]);

    const showResults = isFocused && query.length > 0;

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
             <SearchInput
                placeholder="Global Search..."
                value={query}
                onChange={setQuery}
                onFocus={() => setIsFocused(true)}
                className="[&>input]:bg-slate-100 dark:[&>input]:bg-slate-800"
             />

            {showResults && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 z-40 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                        {results.length > 0 ? (
                            (Object.entries(groupedResults) as [string, SearchResult[]][]).map(([type, items]) => (
                                <div key={type}>
                                    <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-4 py-1.5">{type}s</h3>
                                    <ul>
                                        {items.map((result) => (
                                            <li key={`${result.type}-${result.item.id}`}>
                                                <button onClick={() => handleSelect(result)} className="w-full text-left px-4 py-2 flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-tinedy-blue/10 hover:text-tinedy-blue dark:hover:bg-tinedy-blue/20 transition-colors">
                                                    {result.type === 'customer' && <UsersIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />}
                                                    {result.type === 'staff' && <BriefcaseIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />}
                                                    {result.type === 'booking' && <ListBulletIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />}
                                                    
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                                                            {result.type === 'booking' ? `Booking for ${result.item.customer.name}` : result.item.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                                                            {result.type !== 'booking' && <span>{result.item.email}</span>}
                                                            {result.type === 'customer' && result.matchContext && (
                                                                <>
                                                                    <span className="font-bold text-slate-300 dark:text-slate-600">&middot;</span>
                                                                    <span className="font-semibold text-tinedy-blue dark:text-tinedy-green">{result.matchContext}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            debouncedQuery.length >= 2 && <p className="p-4 text-center text-sm text-slate-500">No results found for "{debouncedQuery}"</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;