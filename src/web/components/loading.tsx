import React from "react";
import styles from "./loading.module.css";

export function Loading({ children }: React.PropsWithChildren) {
    return (
        <div className={`flex items-center gap-2 ${styles.loading}`}>
            <svg width="40px" height="40px" viewBox="0 0 100 100">
                <circle className={styles.outer} cx="50" cy="50" r="45" stroke="#207868" fill="transparent" strokeWidth="5px" />
                <circle className={styles.inner} cx="50" cy="50" r="35" stroke="#20786899" fill="transparent" strokeWidth="5px" />
            </svg>
            <span>{children}</span>
        </div>
    );
}
