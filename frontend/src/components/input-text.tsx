import { forwardRef } from 'react';
import { Input } from './ui/input';
import type { FieldError } from 'react-hook-form';
import { Label } from './ui/label';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    type: React.HTMLInputTypeAttribute;
    errors?: FieldError;
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
    ({ label, type, errors, value, ...props }, ref) => {

        return (
            <div className="space-y-2">
                <Label className='font-semibold text-foreground text-sm' htmlFor={props.id}>
                    {label}
                </Label>
                <Input
                    id={props.id}
                    ref={ref}
                    type="text"
                    value={value}
                    className="bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-200"
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
