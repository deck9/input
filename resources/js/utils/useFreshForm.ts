import { router } from "@inertiajs/vue3";
import { callGetForm } from "@/api/forms";
import { useForm } from "@/stores";

// browser Back and Forward show a page with its old props from history; a tab
// change in the address has no state and keeps the page
let fromHistory = false;
// a page asked for while a form save is on its way can get the form from before it
let askedDuringSave = false;
let savesOnTheirWay = 0;
let saves: Promise<unknown> = Promise.resolve();
// counts page changes, so a late form load can see that the page moved on
let navigations = 0;
let loading: Promise<unknown> = Promise.resolve();

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
// from before a change, from history or from a save that hadn't landed yet;
// onFresh remounts the parts that copied the old form
export function useFreshForm(onFresh?: () => void) {
    if (!fromHistory && !askedDuringSave) {
        return;
    }

    fromHistory = false;
    askedDuringSave = false;
    const page = navigations;
    const store = useForm();

    // a visit started meanwhile wins; the address and the tab stay as they are
    const formHere = () => (page === navigations ? store.form : null);

    loading = saves
        .then(() => {
            const form = formHere();
            return form && callGetForm(form);
        })
        .then((response) => {
            if (response && formHere()?.uuid === response.data.uuid) {
                store.form = response.data;
                onFresh?.();
            }
        })
        // the page keeps the form it came with
        .catch(() => {});
}

// a copy of the form taken before this lands can be older than the page's form
export function freshFormLoaded() {
    return loading;
}
