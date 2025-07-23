import InputPassword from "@/components/input-password";
import InputText from "@/components/input-text";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/contexts/ToastContext";
import useUser from "@/hooks/use-user";
import { ROUTES } from "@/utils/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpStatusCode, isAxiosError } from "axios";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CloudUpload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

export default function ForgotPasswordPage() {
    const { getUserByEmail, generateRecoveryCode, verifyRecoveryCode, updatePassword } = useUser();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const newPasswordSchema = z.object({
        password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        confirmPassword: z.string().min(6, { message: "Confirmação de senha é obrigatória" }),
    }).refine(data => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

    type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

    const { register, handleSubmit, formState } = useForm<NewPasswordFormData>({
        resolver: zodResolver(newPasswordSchema)
    });

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [codeVerified, setCodeVerified] = useState(false);

    const handleSendEmail = async () => {
        if (!email) return;
        setSending(true);

        try {
            await getUserByEmail(email);

            try {
                await generateRecoveryCode(email);
            } catch (error) {
                showError("Erro ao enviar o email de recuperação, tente novamente.");
                return;
            }

            setOpen(true);
        } catch (error) {
            if (!isAxiosError(error)) {
                showError("Erro ao buscar usuário, tente novamente.");
                return;
            }

            const status = error.response?.status;

            if (status === HttpStatusCode.NotFound) {
                showError("Nenhum usuário encontrado com esse email.");
            }
        } finally {
            setSending(false);
        }
    }

    const handleVerifyCode = async () => {
        if (!code || !email) return;

        try {
            await verifyRecoveryCode(email, code);
            showSuccess("Código verificado com sucesso! Você pode redefinir sua senha.");
            setOpen(false);
            setCode("");
            setCodeVerified(true);
        } catch (error) {
            setCodeVerified(false);
            if (!isAxiosError(error)) {
                showError("Erro ao verificar o código, tente novamente.");
                return;
            }

            const status = error.response?.status;

            if (status === HttpStatusCode.BadRequest) {
                showError("Código inválido ou expirado. Tente novamente.");
            }
        }
    }

    const onSubmit = async (data: NewPasswordFormData) => {
        if (!email) return;
        try {
            await updatePassword(email, data.password);
            showSuccess("Senha atualizada com sucesso!");
            setCodeVerified(false);
            setEmail("");
            setCode("");
            navigate(ROUTES.login);
        } catch (error) {
            showError("Erro ao atualizar a senha, tente novamente.");
            return;
        }
    }

    return (
        <PageContainer>
            {!codeVerified && (
                <>
                    <p className="text-center text-sm text-muted-foreground">
                        Insira seu email e enviaremos um link para redefinir sua senha.
                    </p>
                    <InputText
                        label="Email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        disabled={open}
                    />
                    <Button
                        disabled={!email || !!open || !!sending}
                        className="w-full mt-4"
                        onClick={handleSendEmail}>
                        {sending ? "Enviando..." : "Enviar e-mail de redefinição"}
                    </Button>
                </>
            )}

            {codeVerified && (
                <>
                    <p className="text-center text-sm text-muted-foreground">
                        Código verificado com sucesso! Você pode redefinir sua senha.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputPassword
                                label="Senha"
                                placeholder="Nova senha"
                                {...register("password")}
                                errors={formState.errors.password}
                            />
                            <InputPassword
                                label="Confirmar Senha"
                                placeholder="Confirme a nova senha"
                                {...register("confirmPassword")}
                                errors={formState.errors.confirmPassword}
                            />

                            <Button type="submit">
                                <CloudUpload /> Atualizar Senha
                            </Button>
                        </div>
                    </form>
                </>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-start">Redefinição de Senha</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Um código de recuperação foi enviado para o seu email. Insira o código abaixo para redefinir sua senha.
                    </DialogDescription>
                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={code}
                        onChange={(e) => setCode(e)}
                    >
                        {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                        ))}
                    </InputOTP>

                    <Button
                        className="w-full mt-4"
                        disabled={!code}
                        onClick={handleVerifyCode}>
                        Verificar Código
                    </Button>
                </DialogContent>

            </Dialog>

        </PageContainer>
    )
}