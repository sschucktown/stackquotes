<script setup lang="ts">
import { ref } from "vue";
import ProjectsOverviewDrawer from "./components/ProjectsOverviewDrawer.vue";

// TEMP demo feed — replace with real HQ data later
const projects = [
  {
    id: "p1",
    client: "Sarah Thompson",
    job: "Maple St Deck",
    option: "Better",
    price: 23800,
    deposit: 3570,
    status: "Awaiting approval",
    category: "awaiting"
  },
  {
    id: "p2",
    client: "Aaron Patel",
    job: "Lakeview Fence",
    option: "Not selected",
    price: 18600,
    deposit: 2790,
    status: "Awaiting approval",
    category: "awaiting"
  },
  {
    id: "p3",
    client: "Julia Reyes",
    job: "Pine Ave Deck",
    option: "Good",
    price: 16400,
    deposit: 2460,
    status: "Needs scheduling",
    category: "needs-scheduling"
  }
];

// Drawer visibility + selected project
const drawerOpen = ref(false);
const selectedProject = ref(null);

const openDrawer = (project: any) => {
  selectedProject.value = project;
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
  selectedProject.value = null;
};
</script>

<template>
  <div class="mx-auto max-w-5xl p-6 space-y-8">

    <h1 class="text-2xl font-semibold text-slate-900">Projects Overview</h1>

    <!-- Awaiting approval -->
    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        Awaiting Client Approval
      </h2>

      <div
        v-for="p in projects.filter(p => p.category === 'awaiting')"
        :key="p.id"
        @click="openDrawer(p)"
        class="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-900 font-medium">{{ p.client }} — {{ p.job }}</p>
            <p class="text-slate-500 text-sm">{{ p.option }} option</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-slate-900">
              {{ p.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
            </p>
            <p class="text-slate-500 text-xs">Deposit {{ p.deposit }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Needs scheduling -->
    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        Needs Scheduling
      </h2>

      <div
        v-for="p in projects.filter(p => p.category === 'needs-scheduling')"
        :key="p.id"
        @click="openDrawer(p)"
        class="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-900 font-medium">{{ p.client }} — {{ p.job }}</p>
            <p class="text-slate-500 text-sm">{{ p.option }} option</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-slate-900">
              {{ p.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
            </p>
            <p class="text-slate-500 text-xs">Deposit {{ p.deposit }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Drawer Component -->
    <ProjectsOverviewDrawer
      :open="drawerOpen"
      :project="selectedProject"
      @close="closeDrawer"
    />
  </div>
</template>
