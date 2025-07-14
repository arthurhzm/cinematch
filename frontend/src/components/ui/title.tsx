export default function Title({ children }: { children: React.ReactNode }) {
    return (
        <h1 className="text-2xl font-bold text-foreground">
            {children}
        </h1>
    );
}