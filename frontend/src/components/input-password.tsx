import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from "lucide-react"
import { Button } from './ui/button';
import type { FieldError } from 'react-hook-form';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface InputPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    errors?: FieldError;
}

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
    ({ label, errors, value, ...props }, ref) => {

        const [showPassword, setShowPassword] = useState<boolean>(false);

        return (
            <div className="space-y-2">
                <Label className='font-semibold text-foreground text-sm' htmlFor={props.id}>
                    {label}
                </Label>
                <div className='flex'>
                    <Input
                        className='rounded-r-none bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-200'
                        type={!showPassword ? 'password' : 'text'}
                        ref={ref}
                        value={value}
                        {...props}
                    />
                    <Button
                        type='button'
                        size={"icon"}
                        variant="outline"
                        className="rounded-l-none border-l-0 h-9 border-border"
                        onClick={() => setShowPassword(!showPassword)}>
                        {!showPassword ? <Eye className='text-primary' /> : <EyeOff className='text-primary' />}
                    </Button>
                </div>
                {errors && <span className="text-destructive text-xs mt-1">{errors.message}</span>}
            </div>
        );
    }
);

InputPassword.displayName = 'InputPassword';

export default InputPassword;
