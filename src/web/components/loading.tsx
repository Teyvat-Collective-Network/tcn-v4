import React from "react";
import styles from "./loading.module.css";

export function Loading({ children, size }: React.PropsWithChildren<{ size?: number }>) {
    return (
        <div className={`flex items-center gap-2 ${styles.loading}`}>
            <svg width={`${size ?? 40}px`} height={`${size ?? 40}px`} viewBox="0 0 100 100">
                <circle className={styles.outer} cx="50" cy="50" r="45" stroke="#207868" fill="transparent" strokeWidth="5px" />
                <circle className={styles.inner} cx="50" cy="50" r="35" stroke="#20786899" fill="transparent" strokeWidth="5px" />
            </svg>
            <span style={{ fontSize: `${(size ?? 40) * 0.64}px` }}>{children}</span>
        </div>
    );
}
