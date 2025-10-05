import type { App } from "vue";

import SQBadge from "./components/SQBadge.vue";
import SQButton from "./components/SQButton.vue";
import SQCard from "./components/SQCard.vue";
import SQInput from "./components/SQInput.vue";
import SQModal from "./components/SQModal.vue";
import SQSelect from "./components/SQSelect.vue";
import SQTextarea from "./components/SQTextarea.vue";

export { SQBadge, SQButton, SQCard, SQInput, SQModal, SQSelect, SQTextarea };

export const StackQuotesUI = {
  install(app: App) {
    app.component("SQBadge", SQBadge);
    app.component("SQButton", SQButton);
    app.component("SQCard", SQCard);
    app.component("SQInput", SQInput);
    app.component("SQModal", SQModal);
    app.component("SQSelect", SQSelect);
    app.component("SQTextarea", SQTextarea);
  },
};

export default StackQuotesUI;
