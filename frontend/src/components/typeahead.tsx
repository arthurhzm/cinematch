import { forwardRef, useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface TypeaheadProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    search: any[];
    selectedItems?: any[];
    onSelectionChange?: (selected: any[]) => void;
}

const Typeahead = forwardRef<HTMLInputElement, TypeaheadProps>(
    ({ label, search, selectedItems = [], onSelectionChange, ...props }, ref) => {
        const [inputValue, setInputValue] = useState('');
        const [filteredResults, setFilteredResults] = useState<any[]>([]);
        const [showResults, setShowResults] = useState(false);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            if (inputValue.length >= 3) {
                setLoading(true);
                const results = search.filter(item =>
                    item.name?.toLowerCase().includes(inputValue.toLowerCase())
                );
                setFilteredResults(results);
                setShowResults(true);
                setLoading(false);
            } else {
                setLoading(false);
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
                            {filteredResults.length === 0 ? (
                                <li className="px-3 py-2 text-muted-foreground">Nenhum resultado encontrado</li>
                            ) : (
                                filteredResults.map((item, index) => (
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
                                ))

                            )}

                        </ul>
                    )}

                    {loading && <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">Carregando...</div>}
                </div>
            </div>
        );
    }
);

Typeahead.displayName = 'Typeahead';

export default Typeahead;
