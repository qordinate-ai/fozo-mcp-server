import { z, ZodRawShape } from "zod";
import { createMcpHandler } from "mcp-handler";

const diceSchema = { sides: z.number().int().min(2) } satisfies ZodRawShape;
const weatherSchema = {
  latitude: z.number(),
  longitude: z.number(),
  city: z.string(),
} satisfies ZodRawShape;

const APP_METADATA = {
  name: "Mozo AI",
  title: "Mozo AI",
  subtitle: "AI-powered assistant for your business",
  description:
    "Mozo AI is an AI-powered assistant for your business. It helps you automate your business processes and improve your productivity.",
  version: "1.0.0",
  category: "AI Services",
  location: "India",
  websiteUrl: "https://mozo.ai",
  privacyPolicyUrl: "https://mozo.ai/privacy-policy",
  termsOfServiceUrl: "https://mozo.ai/terms-of-service",
  images: [
    {
      src: "https://mozo.ai/images/screenshot-1.png",
      alt: "Mozo Business",
      type: "portrait",
    },
    {
      src: "https://mozo.ai/images/screenshot-2.png",
      alt: "Mozo Customer",
      type: "portrait",
    },
    {
      src: "https://mozo.ai/images/screenshot-3.png",
      alt: "Mozo Product",
      type: "portrait",
    },
  ],
  icons: [{ src: "https://mozo.ai/icon.png", mimeType: "image/png" }],
};

const handler = createMcpHandler(
  async (server) => {
    server.registerResource(
      "app-metadata",
      "app://metadata",
      {
        description:
          "Application metadata including title, description, images, and legal links",
      },
      async () => ({
        contents: [
          {
            uri: "app://metadata",
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
        inputSchema: diceSchema,
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
        inputSchema: weatherSchema,
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
      tools: {
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
