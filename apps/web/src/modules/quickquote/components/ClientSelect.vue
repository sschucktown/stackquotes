<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-700">Client</h3>
      <SQButton size="sm" variant="ghost" @click="showForm = !showForm">
        {{ showForm ? "Cancel" : "Add Client" }}
      </SQButton>
    </div>
    <div class="mt-4 space-y-4">
      <SQSelect
        :model-value="modelValue"
        label="Select existing client"
        placeholder="Choose a client"
        required
        @update:model-value="onSelect"
      >
        <option value="" disabled>Select a client</option>
        <option
          v-for="client in clients"
          :key="client.id"
          :value="client.id"
        >
          {{ client.name }} - {{ client.email }}
        </option>
      </SQSelect>

      <form v-if="showForm" class="space-y-3" @submit.prevent="create">
        <SQInput v-model="form.name" label="Name" required />
        <SQInput v-model="form.email" type="email" label="Email" required />
        <SQInput v-model="form.phone" label="Phone" />
        <SQTextarea v-model="form.address" label="Address" rows="2" />
        <SQButton type="submit" :loading="submitting">Save Client</SQButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useClientStore } from "@modules/quickquote/stores/clientStore";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const clientStore = useClientStore();
const showForm = ref(false);
const submitting = ref(false);
const form = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
});

const clients = computed(() => clientStore.items);

onMounted(() => {
  if (!clientStore.items.length) {
    clientStore.load();
  }
});

const onSelect = (value: string | number) => {
  emit("update:modelValue", String(value));
};

const create = async () => {
  submitting.value = true;
  try {
    const client = await clientStore.create({ ...form });
    emit("update:modelValue", client.id);
    showForm.value = false;
    form.name = "";
    form.email = "";
    form.phone = "";
    form.address = "";
  } finally {
    submitting.value = false;
  }
};
</script>
