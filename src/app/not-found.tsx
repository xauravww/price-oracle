import { Error404 } from "@/components/ui/pixelated-not-found"

export default function NotFound() {
    return (
        <Error404
            postcardAlt="Price Oracle System Offline"
            curvedTextTop="Price Oracle System"
            curvedTextBottom="Market Intelligence"
            heading="(404) The signal was lost in the noise."
            subtext="The page you are looking for has been de-listed or moved to a new exchange."
            backButtonLabel="Return to Home"
            backButtonHref="/"
        />
    )
}
