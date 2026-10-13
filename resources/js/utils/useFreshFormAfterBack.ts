import { router } from "@inertiajs/vue3";

// browser Back and Forward show a page with its old props from history; a tab
// change in the address has no state and keeps the page
let fromHistory = false;
window.addEventListener("popstate", (event) => {
  fromHistory = event.state !== null;
});
router.on("before", () => {
  fromHistory = false;
});

// call it in a page's setup: loads the form again when the page came from
// history, so it shows changes made on the other page
export function useFreshFormAfterBack() {
  if (!fromHistory) {
    return;
  }

  fromHistory = false;
  router.visit(location.href, {
    only: ["form"],
    replace: true,
    preserveScroll: true,
  });
}
