import { forwardRef } from 'react';
import { Input } from './ui/input';
import type { FieldError } from 'react-hook-form';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    errors?: FieldError;
    className?: string;
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
    ({ label, errors, value, className, ...props }, ref) => {

        return (
            <div className="space-y-2 w-full">
                <Label className='font-semibold text-foreground text-sm' htmlFor={props.id}>
                    {label}
                </Label>
                <Input
                    id={props.id}
                    ref={ref}
                    type="text"
                    value={value}
                    className={cn(className, `bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-200`)}
                    {...props}
                />
                {errors && (
                    <span className="text-destructive text-xs flex items-center gap-1">
                        {errors.message}
                    </span>
                )}
            </div>
        );
    }
);

InputText.displayName = 'InputText';

export default InputText;
