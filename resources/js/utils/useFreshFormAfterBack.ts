import { router } from "@inertiajs/vue3";

// browser Back and Forward show a page with its old props from history; a tab
// change in the address has no state and keeps the page
let fromHistory = false;
// counts page changes, so a late reload can see that the page moved on
let navigations = 0;
// a save sent on Back must land before the reload reads the form
let pendingSave: Promise<unknown> | undefined;

window.addEventListener("popstate", (event) => {
    fromHistory = event.state !== null;
    if (fromHistory) {
        navigations++;
    }
});
router.on("before", () => {
    fromHistory = false;
    navigations++;
});

export function finishBeforeReload(save: Promise<unknown> | undefined) {
    pendingSave = save;
}

// call it in a page's setup: loads the form again when the page came from
// history, so it shows changes made on the other page
export function useFreshFormAfterBack() {
    if (!fromHistory) {
        return;
    }

    fromHistory = false;
    const page = navigations;

    Promise.resolve(pendingSave).finally(() => {
        // a visit started meanwhile wins
        if (page !== navigations) {
            return;
        }

        router.visit(location.href, {
            only: ["form"],
            replace: true,
            preserveScroll: true,
        });
    });
}
