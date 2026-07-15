import { LoaderCircleIcon, PowerIcon, RefreshCw, User, User2 } from "lucide-react";
import { useEffect, useState, type JSX } from "react"
import defaultIcon from "~/assets/default-icon.png"
import type { Route } from "./+types/server";
import { useFetcher, useRevalidator, useSubmit } from "react-router";


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
    const response = await fetch(import.meta.env.VITE_API_URL, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    const {status, ...json} = await response.json();

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

export async function clientAction() {
    return fetch(import.meta.env.VITE_API_URL, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
    });
}

export default function Page({loaderData: status} : Route.ComponentProps) {
    const {submit, state} = useFetcher();
    const {revalidate} = useRevalidator();

    useEffect(() => {
        if (status != "paused") {
            const i = setInterval(revalidate, 10000);
            return () => clearInterval(i);
        }
    }, [status])
    
    return (
        <main className="flex justify-center pt-8 pb-4">
            <div className="flex flex-col gap-4">
                <div className="flex place-content-between items-center">
                    <div className="align-middle">Server Thing ({state})</div>
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
        <img src={status.image ?? defaultIcon} className="h-full"/>
        <div className="flex-grow pl-4">
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
    const isPaused = status === "paused";
    return (
        <div className="flex justify-center items-center bg-mist-400 w-xl h-36">
            <button disabled={!isPaused} onClick={startServer} className="flex items-center gap-2 disabled:opacity-50 w-45 bg-green-500 px-4 py-3 rounded">
                {
                    isPaused ? <><PowerIcon/> server paused</>
                    : <><LoaderCircleIcon className="animate-spin"/> starting server</>
                }
            </button>
        </div>
    )
}
