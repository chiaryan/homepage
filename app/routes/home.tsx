import type { Route } from "./+types/home";
import loue from "~/assets/loe.jpg"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Louie!!!!" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <img src={loue}/>;
}
