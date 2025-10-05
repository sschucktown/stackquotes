import { getServiceClient } from "./supabase";

export const uploadPdf = async (
  path: string,
  content: Uint8Array,
  options: { contentType?: string } = {}
): Promise<string> => {
  const supabase = getServiceClient();
  await supabase.storage.createBucket("estimates", { public: false }).catch(() => undefined);

  const bucket = supabase.storage.from("estimates");
  const { error } = await bucket.upload(path, content, {
    upsert: true,
    contentType: options.contentType ?? "application/pdf",
  });
  if (error) {
    throw error;
  }

  const { data: signed, error: signedError } = await bucket.createSignedUrl(path, 60 * 60 * 24);
  if (signedError || !signed?.signedUrl) {
    throw signedError ?? new Error("Unable to generate signed URL");
  }
  return signed.signedUrl;
};

