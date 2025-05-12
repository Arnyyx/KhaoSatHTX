export function Footer() {
    return (
        <footer className="bg-muted/50 border-t">
            <div className="container py-8 flex flex-col items-center justify-around gap-6 md:flex-row md:py-12">
                <p className="text-center w-full text-sm text-muted-foreground md:w-auto">
                    © {new Date().getFullYear()} HTX Survey. All rights reserved.
                </p>
                <nav className="flex flex-col items-center gap-2 text-sm text-muted-foreground md:flex-row md:gap-6">
                    <a
                        href="#"
                        className="hover:text-foreground transition-colors"
                    >
                        Điều khoản
                    </a>
                    <a
                        href="#"
                        className="hover:text-foreground transition-colors"
                    >
                        Chính sách
                    </a>
                    <a
                        href="#"
                        className="hover:text-foreground transition-colors"
                    >
                        Liên hệ
                    </a>
                    <span className="hidden md:inline-block">|</span>
                    <span>Email: htxsupport@example.com</span>
                    <span>Hotline: 0123 456 789</span>
                </nav>
            </div>
        </footer>
    );
}
