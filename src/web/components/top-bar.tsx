"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import { FaBuildingColumns, FaEarthAmericas, FaIdBadge, FaShieldHalved } from "react-icons/fa6";
import { useUserContext } from "../context/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Container } from "./ui/container";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";

export function TopBar({ root }: { root: string }) {
    const user = useUserContext();
    const pathname = usePathname();

    const sites = [
        { url: "/", name: "Home", description: "Home/landing page for the TCN — learn about the network here" },
        { url: "/forms", name: "Forms", description: "TCN forms — apply to the TCN or submit banshares here" },
    ];

    if (user?.council) sites.push({ url: "/council", name: "Council", description: "Section for the TCN Council" });
    if (user?.globalMod || user?.observer) sites.push({ url: "/global", name: "Global Chat", description: "Control panel for the TCN Global Chat" });
    if (user?.observer) sites.push({ url: "/admin", name: "Admin", description: "Admin panel for TCN observers" });

    return (
        <Container>
            <div className="flex items-center justify-between my-8">
                <a href={root}>
                    <div className="flex items-center gap-4">
                        <Image src="/favicon.ico" alt="TCN Icon" width={80} height={80}></Image>
                        <span className="text-3xl font-semibold">
                            <div className="lg:hidden">TCN</div>
                            <div className="hidden lg:block">Teyvat Collective Network</div>
                        </span>
                    </div>
                </a>
                <NavigationMenu className="hidden md:block">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Sites</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="p-4 w-96">
                                    {sites.map(({ url, name, description }, index) => (
                                        <React.Fragment key={index}>
                                            {index === 0 ? null : <hr />}
                                            <NavigationMenuLink href={url} key={url}>
                                                <div className="px-4 py-2 rounded hover:bg-foreground/5 transition-colors">
                                                    <p>
                                                        <b>{name}</b>
                                                    </p>
                                                    <p>{description}</p>
                                                </div>
                                            </NavigationMenuLink>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Quick Links</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="p-4 w-96">
                                    <ul className="list-disc list-inside">
                                        <li>
                                            <a href="/partners" className="link">
                                                Our Partners
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/contact" className="link">
                                                Contact Us
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/join" className="link">
                                                Join the TCN
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/constitution" className="link">
                                                TCN Constitution
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/banshare" className="link">
                                                Submit a Banshare
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <>
                                <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="p-4 w-96">
                                        {user ? (
                                            <div className="flex flex-col">
                                                <div className="px-4 py-2 flex items-center gap-4">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage src={user.image}></AvatarImage>
                                                        <AvatarFallback>{user.tag.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-semibold">{user.name}</span>
                                                        <span className="text-md font-light opacity-50">@{user.tag}</span>
                                                    </div>
                                                    {user.staff ? <FaIdBadge title="Network Staff"></FaIdBadge> : null}
                                                    {user.globalMod ? <FaEarthAmericas title="Global Mod"></FaEarthAmericas> : null}
                                                    {user.council ? <FaBuildingColumns title="TCN Council"></FaBuildingColumns> : null}
                                                    {user.observer ? <FaShieldHalved title="Observer"></FaShieldHalved> : null}
                                                </div>
                                                <hr />
                                                <NavigationMenuLink
                                                    className="px-4 py-2 rounded hover:bg-foreground/5 transition-colors"
                                                    href={`/auth/logout?redirect=${pathname}`}
                                                >
                                                    Log Out
                                                </NavigationMenuLink>{" "}
                                            </div>
                                        ) : (
                                            <p>
                                                You are not currently logged in. Log in with your Discord account{" "}
                                                <a href="/auth/login" className="link">
                                                    here
                                                </a>
                                                .
                                            </p>
                                        )}
                                    </div>
                                </NavigationMenuContent>
                            </>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </Container>
    );
}
