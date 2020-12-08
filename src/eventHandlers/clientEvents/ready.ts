import request from "request";
import soundCloud from "soundcloud-scraper";
import Client from "../../base/Client";

export default async function ready(client: Client): Promise<void> {
    client.log("client event - ready");
    client.log("readyHandler - creating new soundCloud client");
    client.soundCloud = new soundCloud.Client((await soundCloud.keygen()) as string);
    getSpotifyKey(client);
    console.log(`${new Date().toUTCString()} | Activated`);
    setInterval(() => getSpotifyKey(client), 3600000);
}

function getSpotifyKey(client: Client): void {
    client.log("readyHandler - getSpotifyKey");
    const refresh_token = client.config.spotify_refresh_token;
    const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(
                    client.config.spotify_client_id + ":" + client.config.spotify_client_secret
                ).toString("base64")
        },
        form: {
            grant_type: "refresh_token",
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error: any, response: any, body: any) {
        if (!error && response.statusCode === 200) {
            client.log("getSpotifyKey - key received");
            client.spotify.setAccessToken(body.access_token);
            client.config.spotify_access_key = body.access_token;
        } else console.log(`${new Date().toUTCString()} | An error occured whilst getting a spotify key: ${error}`);
    });
}
