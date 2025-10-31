<template>
  <div class="min-h-screen">
    <div class="mx-auto w-full max-w-5xl">
      <header class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Billing</p>
        <h1 class="text-2xl font-semibold text-slate-900">Payments</h1>
        <p class="mt-1 text-sm text-slate-600">Track received payments and pending balances.</p>
      </header>

      <section class="mt-6 grid gap-4 sm:grid-cols-2">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Received</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">$9,200</p>
          <p class="mt-1 text-xs text-slate-500">Last 30 days</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Pending</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">$2,300</p>
          <p class="mt-1 text-xs text-slate-500">Awaiting payment</p>
        </article>
      </section>

      <section class="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
        Integrate Stripe payouts and invoices here.
      </section>
    </div>
  </div>
</template>

