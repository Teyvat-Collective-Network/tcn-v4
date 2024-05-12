import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { TagsWrapper } from "../context/tags";
import { UserWrapper } from "../context/user";
import getUser from "../lib/get-user";
import "./globals.css";

const rubik = Rubik({ subsets: ["latin"] });

const description =
    "Welcome to the Teyvat Collective Network, a collaboration of high-quality Genshin Impact Discord communities dedicated to uniting the community, fostering fan communities, and providing support and promoting collaboration amongst partners.";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.DOMAIN!),
    title: "Teyvat Collective Network",
    description,
    keywords: ["teyvat", "collective", "network", "genshin", "impact", "tcn"],
    openGraph: {
        type: "website",
        title: "Teyvat Collective Network",
        description,
        url: process.env.DOMAIN,
        images: { url: `${process.env.DOMAIN}/favicon.ico` },
    },
    twitter: { card: "summary" },
};

export const viewport: Viewport = {
    colorScheme: "dark",
    themeColor: "#207868",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getUser();

    return (
        <html lang="en" className="antialiased" suppressHydrationWarning>
            <body className={rubik.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <UserWrapper user={user}>
                        <TagsWrapper>
                            <div className="min-h-screen pb-12 flex flex-col">{children}</div>
                        </TagsWrapper>
                    </UserWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
