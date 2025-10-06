import { getServiceClient } from "./supabase";

const getBucket = async (name: string, options: { public: boolean }) => {
  const supabase = getServiceClient();
  await supabase.storage.createBucket(name, options).catch(() => undefined);
  return supabase.storage.from(name);
};

export const uploadPdf = async (
  path: string,
  content: Uint8Array,
  options: { contentType?: string } = {}
): Promise<string> => {
  const bucket = await getBucket("estimates", { public: false });

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

export const uploadPublicAsset = async (
  bucketName: string,
  path: string,
  content: Uint8Array,
  options: { contentType?: string } = {}
): Promise<string> => {
  const bucket = await getBucket(bucketName, { public: true });
  const { error } = await bucket.upload(path, content, {
    upsert: true,
    contentType: options.contentType ?? "application/octet-stream",
  });
  if (error) throw error;
  const { data } = bucket.getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Unable to generate public URL");
  }
  return data.publicUrl;
};
