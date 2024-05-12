"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import {
    FaBars,
    FaBook,
    FaBookBookmark,
    FaBuildingColumns,
    FaCalendarWeek,
    FaChartLine,
    FaCheckToSlot,
    FaCircleInfo,
    FaClipboardCheck,
    FaClipboardList,
    FaDoorOpen,
    FaEarthAmericas,
    FaHandshake,
    FaHouse,
    FaList,
    FaMoon,
    FaPhone,
    FaScrewdriverWrench,
    FaServer,
    FaSun,
    FaTowerBroadcast,
    FaUserGroup,
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

    if (root === "/")
        links.push(
            ["/about", "About Us", FaCircleInfo],
            ["/partners", "Partners", FaHandshake],
            ["/join", "Join", FaDoorOpen],
            ["/constitution", "Constitution", FaBuildingColumns],
            ["/contact", "Contact Us", FaPhone],
            ["/quickstart", "Quickstart", FaBookBookmark],
            ["/docs", "Documentation", FaBook],
        );

    if (root === "/forms") links.push(["/apply", "Apply to Join", FaDoorOpen], ["/banshare", "Submit a Banshare", FaTowerBroadcast]);

    if (root === "/admin")
        links.push(
            ["/admin/onboarding", "Observer Onboarding", FaDoorOpen],
            ["/admin/observation-guide", "Observation Guide", FaClipboardList],
            ["/admin/monitor", "Monitor", FaChartLine],
            ["/admin/servers", "Manage Servers", FaServer],
            ["/admin/users", "Manage Users", FaUserGroup],
            ["/admin/vote-tracker", "Vote Tracker", FaClipboardCheck],
        );

    if (root === "/council")
        links.push(
            ["/audit-logs", "Audit Log", FaClipboardList],
            ["/observer-terms", "Observer Terms", FaCalendarWeek],
            ["/election-history", "Election History", FaCheckToSlot],
        );

    return (
        <>
            <div className="z-10 hidden md:block fixed pl-4 pt-4">
                <button onClick={() => setOpen(true)}>
                    <FaBars className="text-2xl text-muted-foreground" />
                </button>
            </div>
            <div className="md:hidden fixed w-screen h-14 pl-4 pt-4 bg-secondary">
                <button onClick={() => setOpen(true)}>
                    <FaBars className="text-2xl text-muted-foreground" />
                </button>
            </div>
            <div className="md:hidden h-14" />
            <div
                className="fixed z-20 bg-background/90 backdrop-blur-[2px] h-screen w-[calc(min(90%,400px))]"
                style={{ translate: open ? "0" : "-100%", transition: "translate 200ms" }}
            >
                <div className="w-full h-full bg-muted-foreground/5">
                    <div className="p-4">
                        <button className="text-2xl text-muted-foreground" onClick={() => setOpen(false)}>
                            <FaXmark />
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <button className="px-4 py-2 hidden dark:flex items-center gap-2 hover:bg-foreground/5" onClick={() => setTheme("light")}>
                            <FaSun />
                            Switch to Light Mode
                        </button>
                        <button className="px-4 py-2 flex dark:hidden items-center gap-2 hover:bg-foreground/5" onClick={() => setTheme("dark")}>
                            <FaMoon />
                            Switch to Dark Mode
                        </button>
                        <hr />
                        {links.map((item, i) => {
                            if (item === null) return <hr key={i} className="my-2" />;

                            const [link, title, icon] = item;

                            return (
                                <a
                                    key={link}
                                    href={link}
                                    className={`px-4 py-2 flex items-center gap-2 ${root === link ? "bg-foreground/10" : "hover:bg-foreground/5"}`}
                                >
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
            />
        </>
    );
}
