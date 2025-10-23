<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
    >
      <div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          class="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
          @click="handleClose"
        >
          <span class="sr-only">Close</span>
          ×
        </button>

        <div class="space-y-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
              Test Mode — For Staging Only
            </p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Activate Pro Plan (Test)</h2>
            <p class="mt-1 text-sm text-slate-600">
              Enter a Stripe <strong>test card</strong> to simulate a Pro subscription. This flow is
              only available with test API keys and will not charge real cards.
            </p>
          </div>

          <div
            ref="cardContainer"
            class="rounded-xl border border-slate-200 bg-white px-3 py-4 shadow-inner"
          />

          <div class="space-y-2 text-sm text-slate-600">
            <p>Use Stripe test cards such as <code class="rounded bg-slate-100 px-1">4242 4242 4242 4242</code>.</p>
            <p class="text-xs text-slate-500">
              3DS test: <code class="rounded bg-slate-100 px-1">4000 0027 6000 3184</code>
            </p>
          </div>

          <p v-if="errorMessage" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {{ errorMessage }}
          </p>
          <p v-if="successMessage" class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
            {{ successMessage }}
          </p>

          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
              :disabled="loading"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading || successMessage !== null"
              @click="handleSubmit"
            >
              <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              <span>{{ loading ? "Processing..." : "Complete Test Checkout" }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch, nextTick } from "vue";
import { loadStripe, type Stripe, type StripeCardElement, type StripeElements } from "@stripe/stripe-js";
import { apiFetch } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface CreateSubscriptionResponse {
  client_secret: string | null;
  subscriptionId: string;
  customerId: string;
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "success"): void;
}>();

const { user } = useAuth();

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ??
  import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
  "";

const stripeInstance = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const cardElement = ref<StripeCardElement | null>(null);
const cardContainer = ref<HTMLDivElement | null>(null);

const loading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const initialiseStripe = async () => {
  if (!props.open) return;
  await nextTick();
  if (!stripePublishableKey) {
    errorMessage.value = "Stripe publishable key is not configured for test checkout.";
    return;
  }
  if (!stripeInstance.value) {
    stripeInstance.value = await loadStripe(stripePublishableKey);
  }
  if (!stripeInstance.value) {
    errorMessage.value = "Unable to initialise Stripe.";
    return;
  }
  if (!cardContainer.value) {
    errorMessage.value = "Card container missing.";
    return;
  }
  if (!elements.value) {
    elements.value = stripeInstance.value.elements();
  }
  if (!cardElement.value) {
    cardElement.value = elements.value.create("card", { hidePostalCode: true });
    cardElement.value.mount(cardContainer.value);
  }
};

const destroyStripe = () => {
  if (cardElement.value) {
    cardElement.value.unmount();
    cardElement.value = null;
  }
  elements.value = null;
};

watch(
  () => props.open,
  (open) => {
    if (open) {
      void initialiseStripe();
    } else {
      destroyStripe();
      errorMessage.value = null;
      successMessage.value = null;
      loading.value = false;
    }
  }
);

onBeforeUnmount(() => {
  destroyStripe();
});

const handleClose = () => {
  if (loading.value) return;
  emit("close");
};

const handleSubmit = async () => {
  if (!stripeInstance.value || !cardElement.value) {
    errorMessage.value = "Stripe card element not ready.";
    return;
  }
  const authUser = user.value;
  if (!authUser) {
    errorMessage.value = "You must be signed in to complete this action.";
    return;
  }

  loading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    const { paymentMethod, error } = await stripeInstance.value.createPaymentMethod({
      type: "card",
      card: cardElement.value,
      billing_details: {
        email: authUser.email ?? undefined,
      },
    });
    if (error || !paymentMethod) {
      throw new Error(error?.message ?? "Unable to create payment method.");
    }

    const response = await apiFetch<CreateSubscriptionResponse>("/stripe/create-subscription-test", {
      method: "POST",
      body: JSON.stringify({
        user_id: authUser.id,
        payment_method_id: paymentMethod.id,
      }),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    const payload = response.data;
    if (!payload) {
      throw new Error("Missing Stripe response.");
    }

    if (payload.client_secret) {
      const confirmation = await stripeInstance.value.confirmCardPayment(payload.client_secret);
      if (confirmation.error) {
        throw new Error(confirmation.error.message ?? "Card confirmation failed.");
      }
    }

    const { error: supabaseError } = await supabase
      .from("profiles")
      .update({ subscription_tier: "pro" })
      .eq("id", authUser.id);
    if (supabaseError) {
      console.error("[billing] failed to update profile", supabaseError);
    }

    successMessage.value = "✅ Test subscription created successfully.";
    emit("success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error creating subscription.";
    errorMessage.value = message;
  } finally {
    loading.value = false;
  }
};
</script>
