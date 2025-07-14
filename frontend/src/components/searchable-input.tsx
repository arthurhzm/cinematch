import { forwardRef, useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface SearchableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    search: any[];
    selectedItems?: any[];
    onSelectionChange?: (selected: any[]) => void;
}

const SearchableInput = forwardRef<HTMLInputElement, SearchableInputProps>(
    ({ label, search, selectedItems = [], onSelectionChange, ...props }, ref) => {
        const [inputValue, setInputValue] = useState('');
        const [filteredResults, setFilteredResults] = useState<any[]>([]);
        const [showResults, setShowResults] = useState(false);

        useEffect(() => {
            if (inputValue.length >= 3) {
                const results = search.filter(item =>
                    item.name?.toLowerCase().includes(inputValue.toLowerCase())
                );
                setFilteredResults(results);
                setShowResults(results.length > 0);
            } else {
                setFilteredResults([]);
                setShowResults(false);
            }
        }, [inputValue, search]);

        return (
            <div className="space-y-2">
                <div className="relative">
                    <Input
                        ref={ref}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={label}
                        className="bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-200 pr-10"
                        {...props}
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    {showResults && (
                        <ul className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredResults.map((item, index) => (
                                <li
                                    key={index}
                                    className="px-3 py-2 hover:bg-muted cursor-pointer text-foreground"
                                    onClick={() => {
                                        if (!selectedItems.includes(item)) {
                                            onSelectionChange?.([...selectedItems, item]);
                                        } else {
                                            onSelectionChange?.(selectedItems.filter(i => i !== item));
                                        }
                                        setInputValue('');
                                        setShowResults(false);
                                    }}
                                >
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }
);

SearchableInput.displayName = 'SearchableInput';

export default SearchableInput;
