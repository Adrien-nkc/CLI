export type Integration = "stripe" | "openai" | "twilio" | "resend";

export function generateEnvExample(integration: Integration): string {
  const keys: Record<Integration, string[]> = {
    stripe: ["STRIPE_SECRET_KEY", "STRIPE_PUBLIC_KEY", "STRIPE_WEBHOOK_SECRET"],
    openai: ["OPENAI_API_KEY", "OPENAI_ORG_ID"],
    twilio: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    resend: ["RESEND_API_KEY"],
  };

  const integrationKeys = keys[integration];
  if (!integrationKeys) {
    throw new Error(`Unknown integration: ${integration}`);
  }

  return integrationKeys.map((key) => `${key}=`).join("\n");
}

export function resolveFileName(integration: Integration): string {
  return `${integration}.ts`;
}

export function getSupportedIntegrations(): Integration[] {
  return ["stripe", "openai", "twilio", "resend"];
}

export function isValidIntegration(name: string): name is Integration {
  return getSupportedIntegrations().includes(name as Integration);
}
