import { useState, useEffect } from "react";
import type { Status } from "./page";


function isInOrder(s1Obj: Status, s2Obj: Status): boolean {
    const [s1, s2] = [s1Obj, s2Obj].map(s => typeof s == "string" ? s : "online");
    const sequence = ["paused", "creating", "starting", "online", "pausing", "paused"];
    if (s1 == s2) {
        return true;
    }

    for (let i = 0; i <= sequence.length; i++) {
        if (s1 == sequence[i] && s2 == sequence[i + 1]) {
            return true;
        }
    }

    return false;
}

export function useDelayedStatus(status: Status): Status {
    const [displayStatus, setDisplayStatus] = useState(status);

    useEffect(() => {
        if (isInOrder(displayStatus, status)) {
            setDisplayStatus(status);
        } else {
            const t = setTimeout(() => setDisplayStatus(status), 15000);
            return () => clearTimeout(t);
        }
    }, [status]);

    return displayStatus;
}

