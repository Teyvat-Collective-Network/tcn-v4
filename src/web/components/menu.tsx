"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import {
    FaBars,
    FaBuildingColumns,
    FaCircleInfo,
    FaEarthAmericas,
    FaHandshake,
    FaHouse,
    FaList,
    FaMoon,
    FaScrewdriverWrench,
    FaSun,
    FaXmark,
} from "react-icons/fa6";
import { IconType } from "react-icons/lib";
import { useUserContext } from "../context/user";

export function Menu({ root }: { root: string }) {
    const user = useUserContext();
    const { setTheme } = useTheme();
    const [open, setOpen] = useState<boolean>(false);

    const links: ([string, string, IconType] | null)[] = [
        ["/", "Home", FaHouse],
        ["/forms", "Forms", FaList],
    ];

    if (user?.council) links.push(["/council", "Council", FaBuildingColumns]);
    if (user?.globalMod || user?.observer) links.push(["/global", "Global Chat", FaEarthAmericas]);
    if (user?.observer) links.push(["/admin", "Admin", FaScrewdriverWrench]);

    links.push(null);

    if (root) links.push(["/about", "About Us", FaCircleInfo], ["/partners", "Partners", FaHandshake]);

    return (
        <>
            <div className="z-10 hidden md:block fixed pl-4 pt-4">
                <button onClick={() => setOpen(true)}>
                    <FaBars className="text-2xl text-muted-foreground"></FaBars>
                </button>
            </div>
            <div className="md:hidden fixed w-screen h-14 pl-4 pt-4 bg-secondary">
                <button onClick={() => setOpen(true)}>
                    <FaBars className="text-2xl text-muted-foreground"></FaBars>
                </button>
            </div>
            <div className="md:hidden h-14"></div>
            <div
                className="fixed z-20 bg-background/90 backdrop-blur-[2px] h-screen w-[calc(min(90%,400px))]"
                style={{ translate: open ? "0" : "-100%", transition: "translate 200ms" }}
            >
                <div className="w-full h-full bg-muted-foreground/5">
                    <div className="p-4">
                        <button className="text-2xl text-muted-foreground" onClick={() => setOpen(false)}>
                            <FaXmark></FaXmark>
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <a
                            href="javascript:void(0)"
                            className="px-4 py-1 hidden dark:flex items-center gap-2 hover:bg-foreground/5"
                            onClick={() => setTheme("light")}
                        >
                            <FaSun></FaSun>
                            Switch to Light Mode
                        </a>
                        <a
                            href="javascript:void(0)"
                            className="px-4 py-1 flex dark:hidden items-center gap-2 hover:bg-foreground/5"
                            onClick={() => setTheme("dark")}
                        >
                            <FaMoon></FaMoon>
                            Switch to Dark Mode
                        </a>
                        <hr />
                        {links.map((item, i) => {
                            if (item === null) return <hr key={i}></hr>;

                            const [link, title, icon] = item;

                            return (
                                <a key={link} href={link} className="px-4 py-1 flex items-center gap-2 hover:bg-foreground/5">
                                    {icon({})} {title}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div
                className="fixed z-10 w-screen h-screen bg-background"
                style={{ opacity: open ? "40%" : "0%", pointerEvents: open ? "inherit" : "none" }}
                onClick={() => setOpen(false)}
            ></div>
        </>
    );
}
