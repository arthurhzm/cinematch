import { Search } from 'lucide-react';
import { forwardRef } from 'react';
import { Input } from './ui/input';

interface InputSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    onClick: () => void;
}

const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(
    ({ label, onClick, ...props }, ref) => {

        return (
            <div className="space-y-2">
                <div className="relative">
                    <Input
                        ref={ref}
                        type="text"
                        placeholder={label}
                        className="bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-200 pr-10"
                        {...props}
                    />
                    <Search
                        onClick={onClick}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        );
    }
);

InputSearch.displayName = 'Typeahead';

export default InputSearch;
