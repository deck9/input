import { nextTick, watch, type WatchSource } from "vue";

// A card fills its fields from the saved answer when it opens, which is no
// edit. Call the returned function after that fill: only changes after it save.
export const useSettingsWatch = (
    sources: WatchSource[],
    save: (values: any[]) => void,
) => {
    let ready = false;

    watch(sources, (values) => {
        if (ready) save(values);
    });

    return async () => {
        await nextTick();
        ready = true;
    };
};
