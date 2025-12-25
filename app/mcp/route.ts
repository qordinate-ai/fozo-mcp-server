import { z, ZodRawShape } from "zod";
import { createMcpHandler } from "mcp-handler";
import appMetadata from "./app-metadata.json";

const APP_METADATA = appMetadata;
const URI_METADATA = "file:///app-metadata.json";

const handler = createMcpHandler(
  async (server) => {
    // App metadata for the Qordinate.
    server.registerResource(
      "app-metadata",
      URI_METADATA,
      {
        title: "App metadata",
        description:
          "Application metadata including title, description, images, and legal links",
        mimeType: "application/json",
      },
      async () => ({
        contents: [
          {
            uri: URI_METADATA,
            mimeType: "application/json",
            text: JSON.stringify(APP_METADATA, null, 2),
          },
        ],
      })
    );

    server.registerTool(
      "roll_dice",
      {
        title: "Roll a dice",
        description: "Rolls an N-sided die",
        inputSchema: { sides: z.number().int().min(2) } satisfies ZodRawShape,
      },
      async ({ sides }: { sides: number }) => ({
        content: [
          {
            type: "text" as const,
            text: `🎲 You rolled a ${1 + Math.floor(Math.random() * sides)}!`,
          },
        ],
      })
    );

    server.registerTool(
      "get_weather",
      {
        title: "Get the current weather at a location",
        description: "Get the current weather at a location",
        inputSchema: {
          latitude: z.number(),
          longitude: z.number(),
          city: z.string(),
        } satisfies ZodRawShape,
      },
      async ({
        latitude,
        longitude,
        city,
      }: {
        latitude: number;
        longitude: number;
        city: string;
      }) => {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relativehumidity_2m&timezone=auto`
        );
        const weatherData = await response.json();
        return {
          content: [
            {
              type: "text" as const,
              text: `🌤️ Weather in ${city}: ${weatherData.current.temperature_2m}°C, Humidity: ${weatherData.current.relativehumidity_2m}%`,
            },
          ],
        };
      }
    );
  },
  {
    serverInfo: {
      name: APP_METADATA.name,
      version: APP_METADATA.version,
      title: APP_METADATA.title,
      description: APP_METADATA.description,
      websiteUrl: APP_METADATA.websiteUrl,
      icons: APP_METADATA.icons,
    } as any,
    capabilities: {
      resources: {
        listChanged: true,
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
