import InputText from "@/components/input-text";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/contexts/ToastContext";
import useUser from "@/hooks/use-user";
import { HttpStatusCode, isAxiosError } from "axios";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const { getUserByEmail, generateRecoveryCode } = useUser();
    const { showSuccess, showError } = useToast();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);

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

    return (
        <PageContainer>
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
                </DialogContent>

            </Dialog>

        </PageContainer>
    )
}