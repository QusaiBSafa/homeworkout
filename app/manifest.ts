import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeWorkout",
    short_name: "HomeWorkout",
    description: "Free, science-backed daily home workouts.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e13",
    theme_color: "#0a0e13",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
