"use client";

import { usePathname } from "next/navigation";
import { FaBuildingColumns, FaEarthAmericas, FaIdBadge, FaShieldHalved } from "react-icons/fa6";
import { useUserContext } from "../context/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger } from "./ui/navigation-menu";

export default function Account() {
    const user = useUserContext();
    const pathname = usePathname();

    return (
        <NavigationMenuItem>
            <>
                <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <div className="p-4 w-96">
                        {user ? (
                            <div className="flex flex-col">
                                <div className="px-4 py-2 flex items-center gap-4">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback>{user.tag.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-semibold">{user.name}</span>
                                        <span className="text-md font-light opacity-50">@{user.tag}</span>
                                    </div>
                                    {user.staff ? <FaIdBadge title="Network Staff" /> : null}
                                    {user.globalMod ? <FaEarthAmericas title="Global Mod" /> : null}
                                    {user.council ? <FaBuildingColumns title="TCN Council" /> : null}
                                    {user.observer ? <FaShieldHalved title="Observer" /> : null}
                                </div>
                                <hr />
                                <NavigationMenuLink
                                    className="px-4 py-2 rounded hover:bg-foreground/5 transition-colors"
                                    href={`/auth/logout?redirect=${pathname}`}
                                >
                                    Log Out
                                </NavigationMenuLink>
                                <NavigationMenuLink
                                    className="px-4 py-2 rounded hover:bg-foreground/5 transition-colors"
                                    href={"javascript:void(0)"}
                                    onClick={() => alert("To log out everywhere, go to your user settings in Discord and deauthorize the TCN application.")}
                                >
                                    Log Out Everywhere
                                </NavigationMenuLink>
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
    );
}
