import { LoaderCircleIcon, PowerIcon, User2 } from "lucide-react";
import { useEffect, type JSX } from "react"
import defaultIcon from "~/assets/default-icon.png"
import type { Route } from "./+types/server";
import { useFetcher, useRevalidator} from "react-router";


type OfflineStatus = "paused" | "creating" | "starting" | "pausing";

type OnlineStatus = {
    motd: string;
    players: number;
    maxPlayers: number;
    image?: string;
    url: string;
};

type Status = OfflineStatus | OnlineStatus;

export async function clientLoader({}: Route.ClientLoaderArgs): Promise<Status> {
    
    const {status, ...json} = await getStatus();
    
    switch (status) {
        case "paused":
        case "creating":
        case "starting":
        case "pausing":
            return status;
        case "running":
            return {
                motd: json.motd,
                players: json.players,
                maxPlayers: json.max_players,
                url: json.url,
                ...(json.image ? {image: json.image} : {}),
            };
        default:
            console.error("invalid response", json);
            throw new Error("invalid response")
    }
}
clientLoader.hydrate = true as const;

async function getStatus() {
    const res = await fetch(import.meta.env.VITE_API_URL, {
        headers: { "Content-Type": "application/json" },
        method: "GET",
    });
    return await res.json();
}
async function startServer() {
    return fetch(import.meta.env.VITE_API_URL, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
    });
}

// async function getStatus(): Promise<any> {

//     const arr = [
//         {status: "paused"},
//         {status: "starting"},
//         {status: "creating"},
//         {status: "pausing"},
//         {
//             status: "running",
//             motd: "message",
//             players: 20,
//             max_players: 200,
//             url: "mc.ch"
//         },
//     ]

//     return arr[Math.floor(Math.random() * arr.length)]
// }
// async function startServer(): Promise<void> {
//     return;
// }

export const clientAction = startServer;


export default function Page({loaderData: status} : Route.ComponentProps) {
    const {submit, state} = useFetcher();
    const {revalidate} = useRevalidator();

    if (state !== "idle") {
        status = "starting";
    }

    useEffect(() => {
        if (status != "paused") {
            const i = setInterval(revalidate, 5000);
            return () => clearInterval(i);
        }
    }, [status])
    
    return (
        <main className="flex justify-center pt-8 pb-4">
            <div className="flex flex-col gap-4">
                <div className="flex place-content-between items-center">
                    <div className="align-middle">Server Thing</div>
                    {/* <button onClick={revalidate}><RefreshCw/></button> */}
                </div>
                {
                    typeof status === "string" 
                        // ok since status must be on of the options
                        ? <OfflineServerCard status={status as OfflineStatus} startServer={() => submit({}, {method: 'post'})}/> 
                        : "motd" in status
                            ? <OnlineServerCard status={status}/>
                            : <div className="w-xl h-36 bg-mist-400"/>
                }
            </div>

        </main>
    )
}

function OnlineServerCard({status}: {status: OnlineStatus}): JSX.Element {
    return <div className="flex w-xl h-36 border border-white p-2 font-mono text-xl">
        <div className="h-full aspect-square">
            <img src={status.image ?? defaultIcon} className="size-full"/>
        </div>
        <div className="grow pl-4">
            <div className="flex place-content-between">
                <div>{status.url}</div><div className="flex"><User2 className="mr-1"/> {status.players}/{status.maxPlayers}</div>
            </div>
            <div>
                {status.motd}
            </div>
        </div>
    </div>
}


function OfflineServerCard({status, startServer}: {status: OfflineStatus, startServer(): Promise<void>}): JSX.Element {
    const icon = status === "paused" ? <PowerIcon/> : <LoaderCircleIcon className="animate-spin"/>;
    const text = 
        status === "paused" ? "server paused" :
        status === "pausing" ? "stopping server" :
        status === "starting" ? "starting server" :
        status === "creating" ? "starting server" : undefined;
    const colour = 
        status === "paused" ? "bg-blue-500 hover:bg-blue-600" :
        status === "pausing" ? "bg-red-300" :
        status === "starting" ? "bg-blue-500" :
        status === "creating" ? "bg-blue-500" : undefined;
    
    
    return (
        <div className="flex justify-center items-center bg-mist-400 w-xl h-36">
            <button 
                disabled={status !== "paused"} 
                onClick={startServer} 
                className={`flex disabled:opacity-50 w-48 p-4 gap-2 rounded ${colour}`}
            >
                <div className="start">{icon}</div>
                <div className="grow text-center">{text}</div>
            </button>
        </div>
    )
}
