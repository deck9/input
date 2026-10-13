import { router } from "@inertiajs/vue3";

// browser Back and Forward show a page with its old props from history; a tab
// change in the address has no state and keeps the page
let fromHistory = false;
// a page asked for while a form save is on its way can get the form from before it
let askedDuringSave = false;
let savesOnTheirWay = 0;
let saves: Promise<unknown> = Promise.resolve();
// counts page changes, so a late reload can see that the page moved on
let navigations = 0;

window.addEventListener("popstate", (event) => {
    fromHistory = event.state !== null;
    if (fromHistory) {
        navigations++;
    }
});
router.on("before", () => {
    fromHistory = false;
    askedDuringSave = savesOnTheirWay > 0;
    navigations++;
});

// pages that load meanwhile wait for this save, then load the form again
export function trackFormSave<T>(save: Promise<T>): Promise<T> {
    const done = () => savesOnTheirWay--;

    savesOnTheirWay++;
    save.then(done, done);
    saves = Promise.allSettled([saves, save]);
    return save;
}

// call it in a page's setup: loads the form again when the page may show it
// from before a change, from history or from a save that hadn't landed yet
export function useFreshForm() {
    if (!fromHistory && !askedDuringSave) {
        return;
    }

    fromHistory = false;
    askedDuringSave = false;
    const page = navigations;

    saves.then(() => {
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
