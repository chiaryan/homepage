import { LoaderCircleIcon, PowerIcon, RefreshCw } from "lucide-react";
import { useEffect, useState, type JSX } from "react"


type OfflineStatus = "paused" | "creating" | "starting" | "pausing";

type OnlineStatus = {
    motd: string;
    players: number;
    maxPlayers: number;
    image?: string;
    url: string;
};

type Status = OfflineStatus | OnlineStatus | {};

    
export default function Home() {
    const [status, setStatus] = useState<Status>({});

    async function refreshStatus() {
        const response = await fetch(import.meta.env.VITE_API_URL, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "GET",
        })

        const json = await response.json()

        switch (json.status) {
            case "paused":
            case "creating":
            case "starting":
            case "pausing":
                setStatus(json.status);
                break;
            case "running":
                setStatus({
                    motd: json.motd,
                    players: json.players,
                    maxPlayers: json.maxPlayers,
                    url: json.url,
                    ...(json.image ? {image: json.image} : {}),
                })
            default:
                console.error("invalid response ", json)
                setStatus({});
                break;
        }
    }

    async function startServer() {
        await fetch(import.meta.env.API_URL, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        })
    }

    


    useEffect(() => {refreshStatus(); }, [])
    
    return (
        <main className="flex justify-center pt-8 pb-4">
            <div className="flex flex-col gap-4">
                <div className="flex place-content-between items-center">
                    <div className="align-middle">Server Thing</div>
                    <button onClick={refreshStatus}><RefreshCw/></button>
                </div>
                <div>

                </div>
                {
                    typeof status === "string" 
                        ? <OfflineServerCard status={status as OfflineStatus} startServer={startServer}/> // ok since status must 
                        : "motd" in status 
                            ? <OnlineServerCard status={status}/>
                            : <></>
                }
            </div>
        </main>
    )
}

function OnlineServerCard({status}: {status: OnlineStatus}): JSX.Element {
    return <div>
        <div className="">
            <div>{status.url}</div><div>{status.players}/{status.maxPlayers}</div>
        </div>
        <div>
            {status.motd}
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
